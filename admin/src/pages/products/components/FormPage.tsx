import {
  Button,
  Form,
  Input,
  Select,
  Space,
  Switch,
  TreeSelect,
  message,
} from "antd";
import { useNavigate, useParams } from "react-router-dom";
import { useCallback, useEffect, useRef } from "react";
import {
  useCreateFullProductMutation,
  useCreateProductMutation,
  useGetProductByIdQuery,
  useUpdateFullProductMutation,
  useUpdateProductMutation,
} from "@/common/api/product.api";
import Loading from "@/components/Loading";
import Uploader, { type UploadFileWithExtra } from "@/components/Uploader";

import { useCreateProductImageMutation } from "@/common/api/product-image.api";
import { useGetAllShopsQuery } from "@/common/api/shop.api";
import {
  useUploadAssetMutation,
  useUploadDescriptionImagesMutation,
} from "@/common/api/asset.api";
import ProductVariantSection from "./ProductVariantSection";
import type { ProductFormValues } from "../types";
import { useGetAllCategoriesQuery } from "@/common/api/category.api";
import { buildCategoryTree } from "@/pages/category/utils/helper";
import Editor, { type QuillEditorRef } from "@/components/Editor";
import { uploadImagesInHtml } from "../../../common/utils/uploadImagesInHtml";
import {
  mapImagesToUpload,
  normalizeImages,
  normalizeProductVariants,
} from "../utils/helper";

const FormPage = () => {
  const { id } = useParams();
  const isEdit = !!id;
  const [form] = Form.useForm<ProductFormValues>();
  const editorRef = useRef<QuillEditorRef>(null);
  const navigate = useNavigate();
  const hasVariants = Form.useWatch("has_variants", form);

  const { data: product, isLoading } = useGetProductByIdQuery(
    { id },
    { skip: !isEdit },
  );
  const { data: shops, isLoading: isLoadingShop } = useGetAllShopsQuery();
  const { data: categories, isLoading: isLoadingCategory } =
    useGetAllCategoriesQuery();
  const [createProduct, { isLoading: isCreateProduct }] =
    useCreateProductMutation();
  const [createFullProduct, { isLoading: isCreateProductFull }] =
    useCreateFullProductMutation();
  const [createProductImage, { isLoading: isUploadingImages }] =
    useCreateProductImageMutation();
  const [uploadAsset] = useUploadAssetMutation();
  const [uploadDescriptionImages] = useUploadDescriptionImagesMutation();
  const [updateProduct, { isLoading: isUpdating }] = useUpdateProductMutation();
  const [updateFullProduct, { isLoading: isUpdatingFull }] =
    useUpdateFullProductMutation();
  const isLoadingButton =
    isCreateProduct ||
    isUploadingImages ||
    isCreateProductFull ||
    isUpdating ||
    isUpdatingFull;

  useEffect(() => {
    if (isEdit && product?.description) {
      form.setFieldValue("description", product.description);
      editorRef.current?.setHTML(product.description);
    }
  }, [isEdit, product]);

  useEffect(() => {
    if (isEdit && product && shops?.items?.length) {
      const hasVariants = !!product.variants?.length;
      form.setFieldsValue({
        ...product,
        shop_id: product.shop.id,
        category_id: product.category?.id,
        has_variants: hasVariants,
        images: mapImagesToUpload(product.images),
        variants: normalizeProductVariants(product.variants),
      });
    }
  }, [isEdit, product, shops]);

  useEffect(() => {
    if (!isEdit && hasVariants) {
      form.setFieldsValue({
        price_min: undefined,
        price_max: undefined,
        stock: undefined,
      });
    }
  }, [hasVariants, isEdit]);
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
  const onFinish = async (values: ProductFormValues) => {
    try {
      const images = normalizeImages(values.images);

      const primaryImage = images.find((img) => img.isPrimary);
      if (!primaryImage) {
        message.error("Please select a primary image");
        return;
      }

      let descriptionHtml = values.description;

      if (!isEdit || values.description !== product?.description) {
        descriptionHtml = await uploadDescription(values.description);
      }
      const basePayload = {
        shop_id: values.shop_id,
        category_id: values.category_id,
        name: values.name,
        description: descriptionHtml,
        status: values.status,
      };
      let productId: number;
      if (values.has_variants) {
        if (!values.variants || values.variants.length === 0) {
          message.error("Please create at least one variant");
          return;
        }
      }
      const variants = values?.variants ?? [];

      const normalizedVariants = values.has_variants
        ? variants?.map((v) => ({
            price: Number(v.price),
            stock: Number(v.stock),
            attributes: Array.isArray(v.attributes)
              ? v.attributes.map((a) => ({
                  attribute_name: a.attribute_name,
                  value: a.value,
                }))
              : [],
          }))
        : [];
      if (!isEdit) {
        if (values?.has_variants) {
          const created = await createFullProduct({
            ...basePayload,
            variants: normalizedVariants,
          }).unwrap();

          productId = created.id;
        } else {
          const created = await createProduct({
            ...basePayload,
            price_min: Number(values.price_min),
            price_max: Number(values.price_max),
            stock: Number(values.stock),
          }).unwrap();

          productId = created.id;
        }
      }

      if (isEdit && product) {
        productId = product.id;
        if (values.has_variants) {
          await updateFullProduct({
            id: Number(productId),
            body: {
              ...basePayload,
              variants: normalizedVariants,
            },
          }).unwrap();
        } else {
          await updateProduct({
            id: Number(productId),
            body: {
              ...basePayload,
              price_min: Number(values.price_min),
              price_max: Number(values.price_max),
              stock: Number(values.stock),
            },
          }).unwrap();
        }
      }

      for (const img of images) {
        if (img.url && !img.file) continue;

        if (img.file) {
          const results = await uploadAsset({
            files: [img.file],
            type: "products",
          }).unwrap();

          const uploaded = results[0];

          await createProductImage({
            product_id: productId!,
            url: uploaded.images.original,
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

  if (isLoading || isLoadingShop || isLoadingCategory) return <Loading />;
  return (
    <Form
      form={form}
      initialValues={{
        status: "active",
        has_variants: false,
        customize_variants: false,
        attributes: [],
        variants: [],
      }}
      layout="vertical"
      onFinish={onFinish}
      className="w-full h-full"
    >
      <h2 className="text-xl font-semibold mb-4">
        {isEdit ? "Edit Product" : "Create Product"}
      </h2>

      <Form.Item
        label="Name"
        name="name"
        rules={[{ required: true, message: "Please input product name" }]}
      >
        <Input className="h-10" size="large" />
      </Form.Item>

      <Form.Item
        label="Category"
        name="category_id"
        rules={[{ required: true, message: "Please select category" }]}
      >
        <TreeSelect
          size="large"
          loading={isLoadingCategory}
          treeData={buildCategoryTree(categories?.items ?? [], {
            disableParent: true,
          })}
          placeholder="Select category"
          treeDefaultExpandAll
          showSearch
          allowClear
        />
      </Form.Item>

      <Form.Item
        label="Shop"
        name="shop_id"
        rules={[{ required: true, message: "Please select shop" }]}
      >
        <Select
          loading={isLoadingShop}
          options={shops?.items?.map((s) => ({
            label: s.name,
            value: s.id,
          }))}
          size="large"
        />
      </Form.Item>

      <Form.Item
        label="Has variants"
        name="has_variants"
        valuePropName="checked"
      >
        <Switch />
      </Form.Item>

      <ProductVariantSection
        mode={isEdit ? "edit" : "create"}
        initialVariants={normalizeProductVariants(product?.variants)}
        hasVariants={hasVariants}
      />

      {!hasVariants && (
        <div className="grid grid-cols-3 gap-4">
          <Form.Item
            label="Price Min"
            name="price_min"
            rules={[{ required: true, message: "Please input price min" }]}
          >
            <Input type="number" min={0} size="large" />
          </Form.Item>

          <Form.Item
            label="Price Max"
            name="price_max"
            rules={[
              { required: true, message: "Please input price max" },
              ({ getFieldValue }) => ({
                validator(_, value) {
                  if (!value || value >= getFieldValue("price_min")) {
                    return Promise.resolve();
                  }
                  return Promise.reject("Price max must be >= price min");
                },
              }),
            ]}
          >
            <Input type="number" min={0} size="large" />
          </Form.Item>

          <Form.Item
            label="Stock"
            name="stock"
            rules={[{ required: true, message: "Please input stock" }]}
          >
            <Input type="number" min={0} size="large" />
          </Form.Item>
        </div>
      )}

      <Form.Item
        label="Description"
        name="description"
        rules={[{ required: true, message: "Please input description" }]}
      >
        <Editor
          ref={editorRef}
          onChange={(html) => {
            form.setFieldValue("description", html);
          }}
        />
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
            loading={isLoadingButton}
          >
            Cancel
          </Button>
          <Button type="primary" htmlType="submit" loading={isLoadingButton}>
            {isEdit ? "Update" : "Create"}
          </Button>
        </Space>
      </Form.Item>
    </Form>
  );
};

export default FormPage;
