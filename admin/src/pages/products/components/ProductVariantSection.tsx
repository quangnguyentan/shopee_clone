import { Button, Card, Form, InputNumber, Select, Space } from "antd";
import { MinusCircleOutlined, PlusOutlined } from "@ant-design/icons";
import { useEffect, useRef } from "react";
import type { Attribute, Variant, VariantAttribute } from "../types";
import { buildKey, cartesian } from "../utils/helper";
import { useGetCategoryAttributeByCategoryQuery } from "@/common/api/category-attribute.api";
import ProductVariantSkeleton from "@/components/ProductVariantSkeleton";

type Props = {
  mode: "create" | "edit";
  initialVariants?: Variant[];
  hasVariants?: boolean;
};

export default function ProductVariantSection({
  mode,
  initialVariants = [],
  hasVariants,
}: Props) {
  const form = Form.useFormInstance();

  const categoryId = Form.useWatch<number>("category_id", form);
  const attributes = Form.useWatch<Attribute[]>("attributes", form) ?? [];
  const variants = Form.useWatch<Variant[]>("variants", form) ?? [];
  const prevCategoryRef = useRef<number | null>(null);
  const hydratedRef = useRef(false);
  const { data: categoryAttributes = [], isFetching } =
    useGetCategoryAttributeByCategoryQuery(
      { categoryId },
      { skip: !categoryId || !hasVariants },
    );

  useEffect(() => {
    if (!hasVariants || !categoryId) return;

    if (prevCategoryRef.current && prevCategoryRef.current !== categoryId) {
      form.setFieldsValue({ attributes: [], variants: [] });
      hydratedRef.current = false;
    }

    prevCategoryRef.current = categoryId;
  }, [categoryId, hasVariants]);

  useEffect(() => {
    if (mode !== "edit") return;
    if (!initialVariants.length) return;
    if (hydratedRef.current) return;

    form.setFieldsValue({
      variants: initialVariants,
    });

    hydratedRef.current = true;
  }, [mode, initialVariants]);

  useEffect(() => {
    if (!hasVariants || !categoryAttributes.length) return;

    form.setFieldValue(
      "attributes",
      categoryAttributes.map((a) => ({
        name: a.name,
        values: a.values?.map((v) => v.value) ?? [],
      })),
    );
  }, [categoryAttributes, hasVariants]);

  useEffect(() => {
    if (!hasVariants) {
      form.setFieldsValue({ attributes: [], variants: [] });
      hydratedRef.current = false;
      return;
    }

    if (mode === "edit" && hydratedRef.current) return;

    const validAttrs = attributes.filter(
      (a) => a?.name && Array.isArray(a.values) && a.values.length,
    );

    if (!validAttrs.length) {
      form.setFieldValue("variants", []);
      return;
    }

    const oldMap = new Map(variants.map((v) => [buildKey(v.attributes), v]));

    const nextVariants: Variant[] = cartesian(validAttrs).map((combo) => {
      const key = buildKey(combo);
      const old = oldMap.get(key);

      return {
        attributes: combo,
        price: old?.price ?? 0,
        stock: old?.stock ?? 0,
      };
    });

    form.setFieldValue("variants", nextVariants);
  }, [attributes, hasVariants]);

  if (!hasVariants) {
    return null;
  }

  if (isFetching) {
    return <ProductVariantSkeleton />;
  }

  return (
    <div className="mt-4">
      {hasVariants && (
        <p className="text-sm text-gray-500 mb-4">
          Price and stock will be calculated from variants
        </p>
      )}
      <Form.List name="attributes">
        {(fields, { add, remove }) => (
          <div className="flex flex-col gap-2">
            {fields.map(({ key, name }) => (
              <Space key={key} align="baseline">
                <Form.Item name={[name, "name"]} rules={[{ required: true }]}>
                  <Select
                    placeholder="Attribute"
                    style={{ width: 160 }}
                    options={categoryAttributes.map((a) => ({
                      label: a.name,
                      value: a.name,
                    }))}
                  />
                </Form.Item>

                <Form.Item name={[name, "values"]} rules={[{ required: true }]}>
                  <Select
                    mode="multiple"
                    style={{ width: 320 }}
                    placeholder="Values"
                    options={
                      categoryAttributes
                        .find(
                          (a) =>
                            a.name ===
                            form.getFieldValue(["attributes", name, "name"]),
                        )
                        ?.values?.map((v) => ({
                          label: v.value,
                          value: v.value,
                        })) ?? []
                    }
                  />
                </Form.Item>

                <MinusCircleOutlined onClick={() => remove(name)} />
              </Space>
            ))}

            <Button type="dashed" icon={<PlusOutlined />} onClick={() => add()}>
              Add attribute
            </Button>
          </div>
        )}
      </Form.List>

      <Form.List name="variants">
        {(fields) => (
          <div className="mt-4 flex flex-col gap-3">
            {fields.map(({ key, name }) => {
              const variant = form.getFieldValue(["variants", name]);

              return (
                <Card key={key} size="small">
                  <div className="font-medium mb-2">
                    {variant?.attributes
                      ?.map(
                        (a: VariantAttribute) =>
                          `${a.attribute_name}: ${a.value}`,
                      )
                      .join(" / ")}
                  </div>

                  <Space>
                    <Form.Item
                      name={[name, "price"]}
                      label="Price"
                      rules={[{ required: true }]}
                    >
                      <InputNumber min={0} />
                    </Form.Item>

                    <Form.Item
                      name={[name, "stock"]}
                      label="Stock"
                      rules={[{ required: true }]}
                    >
                      <InputNumber min={0} />
                    </Form.Item>
                  </Space>
                </Card>
              );
            })}
          </div>
        )}
      </Form.List>
    </div>
  );
}
