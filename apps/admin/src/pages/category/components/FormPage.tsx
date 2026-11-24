import { Button, Form, Input, message, Space, TreeSelect } from "antd";
import { useNavigate, useParams } from "react-router-dom";
import { useEffect, useMemo } from "react";
import Loading from "@/components/Loading";
import {
  useCreateCategoryMutation,
  useGetAllCategoriesQuery,
  useGetCategoryByIdQuery,
  useUpdateCategoryMutation,
} from "@/common/api/category.api";
import type { CategoryFormValues } from "../types";
import type { UploadFileWithExtra } from "@/components/Uploader";
import Uploader from "@/components/Uploader";
import { useUploadSingleAssetMutation } from "@/common/api/asset.api";
import { buildCategoryTree } from "../utils/helper";
import { getApiErrorMessage } from "@/common/helper/getApiErrorMessage";

const FormPage = () => {
  const { id } = useParams();
  const isEdit = !!id;
  const [form] = Form.useForm<CategoryFormValues>();
  const navigate = useNavigate();

  const { data: category, isLoading } = useGetCategoryByIdQuery(
    { id },
    { skip: !isEdit },
  );
  const { data: data, isLoading: isGetCategories } = useGetAllCategoriesQuery();
  const categories = data?.items;
  const [createCategory, { isLoading: isCreating }] =
    useCreateCategoryMutation();
  const [updateCategory, { isLoading: isUpdating }] =
    useUpdateCategoryMutation();
  const [uploadSingleAsset, { isLoading: isUploadingImage }] =
    useUploadSingleAssetMutation();
  const isSaving = isCreating || isUpdating || isUploadingImage;

  useEffect(() => {
    if (isEdit && category) {
      form.setFieldsValue({
        name: category.name,
        parent_id: category.parent?.id,
        imageUrl: category.imageUrl
          ? [{ url: category.imageUrl } as UploadFileWithExtra]
          : [],
      });
    }
  }, [category, isEdit]);

  const categoryTree = useMemo(() => {
    if (!categories) return [];
    return buildCategoryTree(categories, {
      excludeId: id,
      disableParent: false,
    });
  }, [categories, id]);

  const onFinish = async (values: CategoryFormValues) => {
    try {
      let imageUrl: string | undefined;

      const img = values.imageUrl?.[0];

      if (img?.originFileObj) {
        const res = await uploadSingleAsset({
          file: img.originFileObj,
          type: "categories",
        }).unwrap();

        imageUrl = res.url;
      }

      if (!img?.originFileObj && img?.url) {
        imageUrl = img.url;
      }

      const payload = {
        name: values.name,
        ...(values.parent_id != null
          ? { parent_id: Number(values.parent_id) }
          : {}),
        imageUrl,
      };

      if (isEdit) {
        if (!id) throw new Error("Category ID is required for update");
        await updateCategory({ id, body: payload }).unwrap();
      } else {
        await createCategory(payload).unwrap();
      }
      message.success(isEdit ? "Updated successfully" : "Created successfully");
      navigate("/categories");
    } catch (error) {
      console.error(error);
      message.error(getApiErrorMessage(error, "Submit failed"));
    }
  };

  if (isLoading || isGetCategories) return <Loading />;

  return (
    <Form form={form} layout="vertical" onFinish={onFinish}>
      <h2 className="text-xl font-semibold mb-4">
        {isEdit ? "Edit Category" : "Create Category"}
      </h2>

      <Form.Item label="Name" name="name" rules={[{ required: true }]}>
        <Input className="h-10" />
      </Form.Item>

      <Form.Item label="Parent Category" name="parent_id">
        <TreeSelect
          allowClear
          placeholder="Select parent category"
          treeData={categoryTree}
          treeDefaultExpandAll
        />
      </Form.Item>

      <Form.Item label="Category Image" name="imageUrl" valuePropName="value">
        <Uploader maxCount={1} />
      </Form.Item>

      <Form.Item>
        <Space className="flex justify-end w-full">
          <Button onClick={() => navigate("/categories")} loading={isSaving}>
            Cancel
          </Button>
          <Button type="primary" htmlType="submit" loading={isSaving}>
            {isEdit ? "Update" : "Create"}
          </Button>
        </Space>
      </Form.Item>
    </Form>
  );
};

export default FormPage;
