import {
  Button,
  Alert,
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
import { useAppSelector } from "@/common/hooks/useAppSelector";
import Editor, { type QuillEditorRef } from "@/components/Editor";
import { uploadImagesInHtml } from "../../../common/utils/uploadImagesInHtml";
import { getApiErrorMessage } from "@/common/helper/getApiErrorMessage";
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
  const isSeller = useAppSelector((state) => state.user.me?.role === "seller");
  const hasVariants = Form.useWatch("has_variants", form);
  const selectedShopId = Form.useWatch("shop_id", form);

  const { data: product, isLoading } = useGetProductByIdQuery(
    { id },
    { skip: !isEdit },
  );
  const { data: shops, isLoading: isLoadingShop } = useGetAllShopsQuery({
    page: 1,
    limit: 100,
  });
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
  const selectedShop =
    shops?.items?.find(
      (shop) => String(shop.id) === String(selectedShopId),
    ) ?? product?.shop;
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
        shop_id: Number(product.shop.id),
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

  useEffect(() => {
    if (!isEdit && isSeller && shops?.items?.[0]) {
      form.setFieldValue("shop_id", shops.items[0].id);
    }
  }, [form, isEdit, isSeller, shops]);
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
        shop_id: Number(values.shop_id),
        category_id: Number(values.category_id),
        name: values.name,
        description: descriptionHtml,
        status: values.status,
      };

      let productId: number;

      if (values.has_variants) {
        if (!values.attributes?.length) {
          message.error("Please create product attributes");
          return;
        }
        if (!values.variants?.length) {
          message.error("Please create at least one variant");
          return;
        }
      }

      const attributes = values.has_variants ? (values.attributes ?? []) : [];

      const normalizedVariants = values.has_variants
        ? (values.variants ?? []).map((v) => ({
            price: Number(v.price),
            stock: Number(v.stock),
          }))
        : [];

      if (!isEdit) {
        if (values.has_variants) {
          const created = await createFullProduct({
            ...basePayload,
            attributes,
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
            id: productId,
            body: {
              ...basePayload,
              attributes,
              variants: normalizedVariants,
            },
          }).unwrap();
        } else {
          await updateProduct({
            id: productId,
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

        const results = await uploadAsset({
          files: [img.file!],
          type: "products",
        }).unwrap();

        await createProductImage({
          product_id: productId!,
          url: results[0].images.original,
          is_primary: img.isPrimary,
        }).unwrap();
      }

      message.success(isEdit ? "Updated successfully" : "Created successfully");
      navigate("/products");
    } catch (e) {
      console.error(e);
      message.error(getApiErrorMessage(e, "Submit failed"));
    }
  };

  if (isLoading || isLoadingShop || isLoadingCategory) return <Loading />;
  if (isSeller && !shops?.items?.length) {
    return (
      <Alert
        type="warning"
        showIcon
        message="Your seller account does not have a shop yet."
        description="Contact an administrator to create and activate your shop before adding products."
      />
    );
  }
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

      {isSeller ? (
        <Form.Item name="shop_id" hidden rules={[{ required: true }]}>
          <Input />
        </Form.Item>
      ) : (
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
      )}

      <Alert
        className="mb-4"
        type={selectedShop?.province_name ? "info" : "warning"}
        showIcon
        message={`Product location: ${selectedShop?.province_name ?? "not set"}`}
        description="Product location is inherited from its shop. Update the shop location to change what buyers see."
        action={
          selectedShop?.id ? (
            <Button
              size="small"
              onClick={() => navigate(`/shops/${selectedShop.id}/edit`)}
            >
              Update shop location
            </Button>
          ) : undefined
        }
      />

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
