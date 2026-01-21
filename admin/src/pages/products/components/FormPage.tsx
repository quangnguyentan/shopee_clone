import { Button, Form, Input, Select, Space, message } from "antd";
import { useNavigate, useParams } from "react-router-dom";
import { useEffect } from "react";
import type { Product } from "@/common/types/product.type";
import {
  useCreateProductMutation,
  useGetProductByIdQuery,
} from "@/common/api/product.api";
import Loading from "@/components/Loading";
import { getAssetUrl } from "@/common/utils/assets";
import Uploader, { type UploadFileWithExtra } from "@/components/Uploader";
import type { UploadFileStatus } from "antd/es/upload/interface";
import TextArea from "antd/es/input/TextArea";
import { useCreateProductImageMutation } from "@/common/api/product-image.api";
import { useGetAllShopsQuery } from "@/common/api/shop.api";
import { useUploadAssetMutation } from "@/common/api/asset.api";

type ProductFormValues = Omit<Product, "images"> & {
  images: UploadFileWithExtra[];
};

type NormalizedImage = {
  url?: string;
  file?: File;
  isPrimary: boolean;
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
  const { data: shops, isLoading: isLoadingShop } = useGetAllShopsQuery();
  const [createProduct, { isLoading: isCreating }] = useCreateProductMutation();
  const [createProductImage, { isLoading: isUploadingImages }] =
    useCreateProductImageMutation();
  const [uploadAsset] = useUploadAssetMutation();
  const mapImagesToUpload = (images?: Product["images"]) =>
    images?.map((img) => ({
      uid: String(img.id),
      name: img.url.split("/").pop(),
      status: "done" as UploadFileStatus,
      url: getAssetUrl(img?.url),
      isPrimary: img.is_primary,
    })) ?? [];

  const extractAssetPath = (url?: string) => {
    if (!url) return undefined;
    const assetBase = import.meta.env.VITE_ASSET_URL;
    return url.startsWith(assetBase) ? url.replace(assetBase, "") : url;
  };

  const normalizeImages = (
    images: UploadFileWithExtra[],
  ): NormalizedImage[] => {
    return images.map((img) => ({
      isPrimary: !!img.isPrimary,
      url: img.url ? extractAssetPath(img.url) : undefined,
      file: img.originFileObj as File | undefined,
    }));
  };

  useEffect(() => {
    if (isEdit && product && shops?.items?.length) {
      form.setFieldsValue({
        ...product,
        shop_id: product.shop.id,
        images: mapImagesToUpload(product.images),
      });
    }
  }, [isEdit, product, shops]);

  const onFinish = async (values: ProductFormValues) => {
    try {
      console.log(values, "values");
      const images = normalizeImages(values.images);

      const primaryImage = images.find((img) => img.isPrimary);
      if (!primaryImage) {
        message.error("Please select a primary image");
        return;
      }

      let productId = Number(id);

      if (!isEdit) {
        const created = await createProduct({
          shop_id: values.shop_id,
          name: values.name,
          description: values.description,
          price_min: values.price_min,
          price_max: values.price_max,
          stock: values.stock,
          status: values.status,
        }).unwrap();

        productId = created.id;
      }

      for (const img of images) {
        if (img.url && !img.file) {
          continue;
        }

        if (img.file) {
          const { url } = await uploadAsset({
            file: img.file,
            type: "product",
          }).unwrap();

          await createProductImage({
            product_id: productId,
            url,
            is_primary: img.isPrimary,
          }).unwrap();
        }
      }

      message.success(isEdit ? "Updated successfully" : "Created successfully");
      navigate("/products");
    } catch (e) {
      console.error(e);
      message.error("Submit failed");
    }
  };

  if (isLoading || isLoadingShop) return <Loading />;

  return (
    <Form
      form={form}
      initialValues={{
        status: "active",
      }}
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

      <Form.Item label="Shop" name="shop_id" rules={[{ required: true }]}>
        <Select
          loading={isLoadingShop}
          options={shops?.items?.map((s) => ({
            label: s.name,
            value: s.id,
          }))}
        />
      </Form.Item>
      <Form.Item
        label="Description"
        name="description"
        rules={[{ required: true }]}
      >
        <TextArea rows={6} />
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
        <Uploader multiple enablePrimary />
      </Form.Item>

      <Form.Item>
        <Space className="flex justify-end w-full pb-4 items-center">
          <Button
            onClick={() => navigate("/products")}
            loading={isCreating || isUploadingImages}
          >
            Cancel
          </Button>
          <Button
            type="primary"
            htmlType="submit"
            loading={isCreating || isUploadingImages}
          >
            {isEdit ? "Update" : "Create"}
          </Button>
        </Space>
      </Form.Item>
    </Form>
  );
};

export default FormPage;
