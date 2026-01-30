import { Button, Form, Input, Select, Space, TreeSelect, message } from "antd";
import { useNavigate, useParams } from "react-router-dom";
import { useEffect, useMemo } from "react";
import Loading from "@/components/Loading";
import {
  useCreateCategoryAttributeMutation,
  useGetCategoryAttributeByIdQuery,
  useUpdateCategoryAttributeMutation,
} from "@/common/api/category-attribute.api";
import { useGetAllCategoriesQuery } from "@/common/api/category.api";
import { buildCategoryTree } from "@/pages/category/utils/helper";

type FormValues = {
  category_id: number;
  name: string;
  type: "select" | "multi-select" | "input";
  allow_custom: boolean;
  order_index: number;
};

const CategoryAttributeFormPage = () => {
  const { id } = useParams();
  const isEdit = !!id;
  const navigate = useNavigate();
  const [form] = Form.useForm<FormValues>();

  const { data, isLoading } = useGetCategoryAttributeByIdQuery(
    { id },
    { skip: !isEdit },
  );
  const { data: allCategories, isLoading: isGetCategories } =
    useGetAllCategoriesQuery();
  const categories = allCategories?.items;

  const [create, { isLoading: isCreating }] =
    useCreateCategoryAttributeMutation();
  const [update, { isLoading: isUpdating }] =
    useUpdateCategoryAttributeMutation();

  const categoryTree = useMemo(() => {
    if (!categories) return [];
    return buildCategoryTree(categories, {
      disableParent: true,
    });
  }, [categories]);

  useEffect(() => {
    if (isEdit && data) {
      form.setFieldsValue(data);
    }
  }, [data, isEdit]);

  const onFinish = async (values: FormValues) => {
    try {
      if (isEdit) {
        await update({ id, body: values }).unwrap();
      } else {
        await create(values).unwrap();
      }
      message.success(isEdit ? "Edit successfully" : "Create successfully");
      navigate(`/categoryAttributes`);
    } catch {
      message.error("Submit failed");
    }
  };

  if (isLoading || isGetCategories) return <Loading />;

  return (
    <Form layout="vertical" form={form} onFinish={onFinish}>
      <h2 className="text-xl font-semibold mb-4">
        {isEdit ? "Edit Attribute" : "Create Attribute"}
      </h2>

      <Form.Item
        label="Category"
        name="category_id"
        rules={[{ required: true }]}
      >
        <TreeSelect
          disabled={isEdit}
          treeData={categoryTree}
          placeholder="Select category"
          treeDefaultExpandAll
          allowClear
        />
      </Form.Item>

      <Form.Item label="Name" name="name" rules={[{ required: true }]}>
        <Input />
      </Form.Item>

      <Form.Item label="Type" name="type" rules={[{ required: true }]}>
        <Select
          options={[
            { label: "Select", value: "select" },
            { label: "Multi Select", value: "multi-select" },
            { label: "Input", value: "input" },
          ]}
        />
      </Form.Item>

      <Form.Item shouldUpdate>
        {() => {
          const type = form.getFieldValue("type");

          if (type === "input") return null;

          return (
            <Form.Item
              label="Allow custom value"
              name="allow_custom"
              initialValue={false}
            >
              <Select
                options={[
                  { label: "Yes", value: true },
                  { label: "No", value: false },
                ]}
              />
            </Form.Item>
          );
        }}
      </Form.Item>

      <Form.Item label="Order" name="order_index">
        <Input type="number" />
      </Form.Item>

      <Space className="flex justify-end w-full">
        <Button onClick={() => navigate(-1)} loading={isCreating || isUpdating}>
          Cancel
        </Button>
        <Button
          type="primary"
          htmlType="submit"
          loading={isCreating || isUpdating}
        >
          {isEdit ? "Save" : "Create"}
        </Button>
      </Space>
    </Form>
  );
};

export default CategoryAttributeFormPage;
