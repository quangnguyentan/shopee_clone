import {
  Button,
  Form,
  Input,
  Space,
  Switch,
  message,
  InputNumber,
  Select,
} from "antd";
import { useNavigate, useParams } from "react-router-dom";
import { useCallback, useEffect, useRef } from "react";
import Loading from "@/components/Loading";
import Uploader, { type UploadFileWithExtra } from "@/components/Uploader";
import Editor, { type QuillEditorRef } from "@/components/Editor";

import {
  useCreateShopMutation,
  useGetShopByIdQuery,
  useUpdateShopMutation,
} from "@/common/api/shop.api";
import {
  useUploadSingleAssetMutation,
  useUploadDescriptionImagesMutation,
} from "@/common/api/asset.api";
import { uploadImagesInHtml } from "@/common/utils/uploadImagesInHtml";
import { getAssetUrl } from "@/common/utils/assets";
import { useGetAllUsersQuery } from "@/common/api/user.api";

type ShopFormValues = {
  name: string;
  description: string;
  is_active: boolean;
  rating?: number;
  user_id?: number;
  logo?: UploadFileWithExtra[];
};

const FormPage = () => {
  const { id } = useParams();
  const isEdit = !!id;

  const [form] = Form.useForm<ShopFormValues>();
  const editorRef = useRef<QuillEditorRef>(null);
  const navigate = useNavigate();

  const { data: shop, isLoading } = useGetShopByIdQuery(
    { id },
    { skip: !isEdit },
  );

  const { data: users } = useGetAllUsersQuery();

  const [createShop, { isLoading: isCreating }] = useCreateShopMutation();
  const [updateShop, { isLoading: isUpdating }] = useUpdateShopMutation();

  const [uploadSingleAsset] = useUploadSingleAssetMutation();
  const [uploadDescriptionImages] = useUploadDescriptionImagesMutation();

  useEffect(() => {
    if (isEdit && shop) {
      form.setFieldsValue({
        name: shop.name,
        is_active: shop.is_active,
        rating: shop.rating,
        description: shop.description,
        user_id: shop.user?.id,
        logo: shop.logo
          ? [
              {
                uid: "logo",
                name: shop.logo.split("/").pop(),
                status: "done",
                url: getAssetUrl(shop.logo),
              },
            ]
          : [],
      });

      editorRef.current?.setHTML(shop.description);
    }
  }, [isEdit, shop]);

  const uploadDescription = useCallback(
    async (html: string) =>
      uploadImagesInHtml(html, async (file) => {
        const result = await uploadDescriptionImages({
          files: [file],
        }).unwrap();

        const url = result.items?.[0]?.url;
        if (!url) throw new Error("Upload description image failed");

        return url.startsWith("http")
          ? url
          : `${import.meta.env.VITE_ASSET_URL}${url}`;
      }),
    [uploadDescriptionImages],
  );

  const onFinish = async (values: ShopFormValues) => {
    try {
      let logo: string | undefined;
      const file = values.logo?.[0];

      if (file?.originFileObj) {
        const res = await uploadSingleAsset({
          file: file.originFileObj,
          type: "shops",
        }).unwrap();
        logo = res.url;
      } else if (file?.url) {
        logo = file.url;
      }

      let descriptionHtml = values.description;

      if (!isEdit || values.description !== shop?.description) {
        descriptionHtml = await uploadDescription(values.description);
      }

      const body = {
        name: values.name,
        description: descriptionHtml,
        is_active: values.is_active,
        rating: values.rating,
        logo,
        user_id: values.user_id,
      };

      if (isEdit) {
        await updateShop({
          id,
          body,
        }).unwrap();
      } else {
        await createShop(body).unwrap();
      }

      message.success(
        isEdit ? "Updated shop successfully" : "Created shop successfully",
      );
      navigate("/shops");
    } catch (err) {
      console.error(err);
      message.error("Submit failed");
    }
  };

  if (isLoading) return <Loading />;

  return (
    <Form
      form={form}
      layout="vertical"
      onFinish={onFinish}
      initialValues={{
        is_active: true,
        rating: 0,
      }}
      className="w-full h-full"
    >
      <h2 className="text-xl font-semibold mb-4">
        {isEdit ? "Edit Shop" : "Create Shop"}
      </h2>

      {!isEdit && (
        <Form.Item
          label="Shop Owner"
          name="user_id"
          rules={[{ required: true, message: "Please select shop owner" }]}
        >
          <Select
            placeholder="Select user"
            options={users?.items?.map((u) => ({
              label: u.email,
              value: u.id,
            }))}
          />
        </Form.Item>
      )}

      <Form.Item
        label="Name"
        name="name"
        rules={[{ required: true, message: "Please input shop name" }]}
      >
        <Input size="large" />
      </Form.Item>

      <Form.Item label="Rating" name="rating">
        <InputNumber min={0} max={5} step={0.1} className="w-full" />
      </Form.Item>

      <Form.Item label="Active" name="is_active" valuePropName="checked">
        <Switch />
      </Form.Item>

      <Form.Item
        label="Description"
        name="description"
        rules={[{ required: true, message: "Please input description" }]}
      >
        <Editor
          ref={editorRef}
          onChange={(html) => form.setFieldValue("description", html)}
        />
      </Form.Item>

      <Form.Item
        label="Shop Logo"
        name="logo"
        rules={[
          {
            validator(_, value: UploadFileWithExtra[]) {
              if (!value || value.length === 0) {
                return Promise.reject("Please upload shop logo");
              }
              return Promise.resolve();
            },
          },
        ]}
      >
        <Uploader maxCount={1} />
      </Form.Item>

      <Form.Item>
        <Space className="flex justify-end w-full pb-4">
          <Button onClick={() => navigate("/shops")}>Cancel</Button>
          <Button
            type="primary"
            htmlType="submit"
            loading={isCreating || isUpdating}
          >
            {isEdit ? "Update" : "Create"}
          </Button>
        </Space>
      </Form.Item>
    </Form>
  );
};

export default FormPage;
