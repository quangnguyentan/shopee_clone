import { Button, Form, Input, Select, Space, message } from "antd";
import { useNavigate, useParams } from "react-router-dom";
import { useEffect } from "react";
import type { Product } from "@/common/types/product.type";
import { useGetProductByIdQuery } from "@/common/api/product.api";
import Loading from "@/components/Loading";
import { getAssetUrl } from "@/common/utils/assets";
import Uploader, { type UploadFileWithExtra } from "@/components/Uploader";
import type { UploadFileStatus } from "antd/es/upload/interface";

type ProductFormValues = Omit<Product, "images"> & {
  images: UploadFileWithExtra[];
};

const FormPage = () => {
  const { id } = useParams();
  const isEdit = !!id;
  const [form] = Form.useForm<ProductFormValues>();
  const navigate = useNavigate();

  const { data: product, isLoading } = useGetProductByIdQuery(
    { id },
    { skip: !isEdit },
  );

  const mapImagesToUpload = (images?: Product["images"]) =>
    images?.map((img) => ({
      uid: String(img.id),
      name: img.url.split("/").pop(),
      status: "done" as UploadFileStatus,
      url: getAssetUrl(img.url),
      isPrimary: img.is_primary,
    })) ?? [];

  const extractAssetPath = (url?: string) => {
    if (!url) return undefined;
    const assetBase = import.meta.env.VITE_ASSET_URL;
    return url.startsWith(assetBase) ? url.replace(assetBase, "") : url;
  };

  useEffect(() => {
    if (isEdit && product) {
      form.setFieldsValue({
        ...product,
        images: mapImagesToUpload(product.images),
      });
    }
  }, [isEdit, product]);

  const onFinish = (values: ProductFormValues) => {
    const primary = values.images.find((f) => f.isPrimary);

    if (!primary) {
      message.error("Please select a primary image");
      return;
    }

    const primary_image = primary.url
      ? extractAssetPath(primary.url)
      : primary.originFileObj;

    const images = values.images
      .filter((f) => !f.isPrimary)
      .map((f) => (f.url ? { url: extractAssetPath(f.url) } : f.originFileObj));

    const payload = {
      ...values,
      primary_image,
      images,
    };

    console.log("Payload:", payload);
  };

  if (isLoading) return <Loading />;

  return (
    <Form
      form={form}
      layout="vertical"
      onFinish={onFinish}
      className="w-full h-full"
    >
      <h2 className="text-xl font-semibold mb-4">
        {isEdit ? "Edit Product" : "Create Product"}
      </h2>

      <Form.Item label="Name" name="name" rules={[{ required: true }]}>
        <Input className="h-10" />
      </Form.Item>

      <Form.Item
        label="Description"
        name="description"
        rules={[{ required: true }]}
      >
        <Input className="h-10" />
      </Form.Item>

      <Form.Item label="Stock" name="stock" rules={[{ required: true }]}>
        <Input type="number" className="h-10" />
      </Form.Item>

      <Form.Item
        label="Price min"
        name="price_min"
        rules={[{ required: true }]}
      >
        <Input type="number" className="h-10" />
      </Form.Item>

      <Form.Item
        label="Price max"
        name="price_max"
        rules={[{ required: true }]}
      >
        <Input type="number" className="h-10" />
      </Form.Item>

      <Form.Item label="Status" name="status" rules={[{ required: true }]}>
        <Select
          options={[
            { label: "Active", value: "active" },
            { label: "Inactive", value: "inactive" },
          ]}
        />
      </Form.Item>

      <Form.Item
        label="Product Images"
        name="images"
        valuePropName="value"
        rules={[
          {
            validator(_, value) {
              if (!value || value.length === 0) {
                return Promise.reject("Please upload product image");
              }
              if (!value.some((v: UploadFileWithExtra) => v.isPrimary)) {
                return Promise.reject("Please select a primary image");
              }
              return Promise.resolve();
            },
          },
        ]}
      >
        <Uploader />
      </Form.Item>

      <Form.Item>
        <Space className="flex justify-end w-full pb-4 items-center">
          <Button onClick={() => navigate("/products")}>Cancel</Button>
          <Button type="primary" htmlType="submit">
            {isEdit ? "Update" : "Create"}
          </Button>
        </Space>
      </Form.Item>
    </Form>
  );
};

export default FormPage;
