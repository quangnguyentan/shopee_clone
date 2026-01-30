import { Button, Form, Input, Select, Space, message } from "antd";
import { useNavigate, useParams } from "react-router-dom";
import { useMemo, useState } from "react";

import { useGetProductVariantByIdQuery } from "@/common/api/product-variant.api";
import { useGetCategoryAttributeByCategoryQuery } from "@/common/api/category-attribute.api";
import { useGetCategoryAttributeValueByAttributeIdQuery } from "@/common/api/category-attribute-value.api";
import { useCreateProductVariantAttributeMutation } from "@/common/api/product-variant-attribute.api";

type FormValues = {
  attribute_id: number;
  value_id?: number;
  custom_value?: string;
};

const ProductVariantAttributeFormPage = () => {
  const { variantId } = useParams<{ variantId: string }>();
  const navigate = useNavigate();
  const [form] = Form.useForm<FormValues>();

  const { data: variant, isLoading: variantLoading } =
    useGetProductVariantByIdQuery(
      { id: Number(variantId) },
      { skip: !variantId },
    );

  const categoryId = variant?.product?.category_id;

  const [selectedAttributeId, setSelectedAttributeId] = useState<number>();

  const { data: attributes, isLoading: attrLoading } =
    useGetCategoryAttributeByCategoryQuery(
      { categoryId: categoryId! },
      { skip: !categoryId },
    );

  const { data: values, isLoading: valueLoading } =
    useGetCategoryAttributeValueByAttributeIdQuery(
      { attributeId: selectedAttributeId! },
      { skip: !selectedAttributeId },
    );

  const [create, { isLoading }] = useCreateProductVariantAttributeMutation();

  const attributeOptions = useMemo(
    () =>
      attributes?.map((a) => ({
        label: a.name,
        value: a.id,
      })) ?? [],
    [attributes],
  );

  const valueOptions = useMemo(
    () =>
      values?.map((v) => ({
        label: v.value,
        value: v.id,
      })) ?? [],
    [values],
  );

  const onFinish = async (values: FormValues) => {
    try {
      await create({
        variant_id: Number(variantId),
        attribute_id: values.attribute_id,
        value_id: values.value_id ?? null,
        custom_value: values.custom_value ?? null,
      }).unwrap();

      message.success("Attribute added to variant");
      navigate(-1);
    } catch {
      message.error("Failed to create attribute");
    }
  };

  const isLoadingPage = variantLoading || attrLoading;

  return (
    <Form
      form={form}
      layout="vertical"
      onFinish={onFinish}
      disabled={isLoadingPage}
    >
      <h2 className="text-xl font-semibold mb-4">Add Variant Attribute</h2>

      <Form.Item
        label="Attribute"
        name="attribute_id"
        rules={[{ required: true }]}
      >
        <Select
          loading={attrLoading}
          options={attributeOptions}
          placeholder="Select attribute"
          onChange={(id) => {
            setSelectedAttributeId(id);
            form.resetFields(["value_id", "custom_value"]);
          }}
        />
      </Form.Item>

      {selectedAttributeId && valueOptions.length > 0 ? (
        <Form.Item label="Value" name="value_id" rules={[{ required: true }]}>
          <Select
            loading={valueLoading}
            options={valueOptions}
            placeholder="Select value"
          />
        </Form.Item>
      ) : selectedAttributeId ? (
        <Form.Item
          label="Custom value"
          name="custom_value"
          rules={[{ required: true }]}
        >
          <Input placeholder="Enter value manually" />
        </Form.Item>
      ) : null}

      <Form.Item>
        <Space className="flex justify-end">
          <Button onClick={() => navigate(-1)}>Cancel</Button>
          <Button
            type="primary"
            htmlType="submit"
            loading={isLoading}
            disabled={!selectedAttributeId}
          >
            Save
          </Button>
        </Space>
      </Form.Item>
    </Form>
  );
};

export default ProductVariantAttributeFormPage;
