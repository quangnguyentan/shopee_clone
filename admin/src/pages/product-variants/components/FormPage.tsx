import { Button, Card, Form, Input, Select, Space } from "antd";
import { useNavigate, useParams } from "react-router-dom";
import { useEffect } from "react";
import Loading from "@/components/Loading";
import { useGetProductVariantByIdQuery } from "@/common/api/product-variant.api";
import { useGetAllProductQuery } from "@/common/api/product.api";
import type { ProductVariant } from "@/common/types/product-variant.type";
import { MinusCircleOutlined, PlusOutlined } from "@ant-design/icons";

const FormPage = () => {
  const { id } = useParams();
  const isEdit = !!id;
  const [form] = Form.useForm<ProductVariant>();
  const navigate = useNavigate();

  const { data: productVariant, isLoading: isProductVariantLoading } =
    useGetProductVariantByIdQuery({ id }, { skip: !isEdit });

  const { data: products, isLoading: isProductsLoading } =
    useGetAllProductQuery();

  useEffect(() => {
    if (isEdit && productVariant) {
      form.setFieldsValue({
        ...productVariant,
        product_id: productVariant.product_id,
      });
    }
  }, [isEdit, productVariant]);

  const onFinish = (values: ProductVariant) => {
    const payload = {
      ...values,
    };

    console.log("Payload:", payload);
  };

  if (isProductVariantLoading || isProductsLoading) return <Loading />;

  return (
    <Form
      form={form}
      layout="vertical"
      onFinish={onFinish}
      className="w-full h-full"
      initialValues={{
        options: [],
      }}
    >
      <h2 className="text-xl font-semibold mb-4">
        {isEdit ? "Edit Product Variant" : "Create Product Variant"}
      </h2>

      <Form.Item label="Product" name="product_id" rules={[{ required: true }]}>
        <Select
          loading={isProductsLoading}
          options={products?.items?.map((p) => ({
            label: p.name,
            value: p.id,
          }))}
          size="large"
        />
      </Form.Item>

      <Form.List name="variants">
        {(variantFields, { add, remove }) => (
          <div className="space-y-4">
            {variantFields.map(({ key, name }) => (
              <Card
                key={key}
                title={`Variant #${name + 1}`}
                extra={
                  <Button danger onClick={() => remove(name)}>
                    Remove
                  </Button>
                }
              >
                <Form.Item
                  label="SKU"
                  name={[name, "sku"]}
                  rules={[{ required: true }]}
                >
                  <Input />
                </Form.Item>

                <Form.Item
                  label="Price"
                  name={[name, "price"]}
                  rules={[{ required: true }]}
                >
                  <Input type="number" />
                </Form.Item>

                <Form.Item
                  label="Stock"
                  name={[name, "stock"]}
                  rules={[{ required: true }]}
                >
                  <Input type="number" />
                </Form.Item>

                <Form.List name={[name, "attributes"]}>
                  {(attrFields, { add: addAttr, remove: removeAttr }) => (
                    <>
                      <h4 className="font-medium">Attributes</h4>

                      {attrFields.map(({ key, name: attrName }) => (
                        <Space key={key} align="baseline">
                          <Form.Item
                            name={[attrName, "name"]}
                            rules={[{ required: true }]}
                          >
                            <Select
                              mode="tags"
                              placeholder="Color / Size"
                              style={{ width: 150 }}
                            />
                          </Form.Item>

                          <Form.Item
                            name={[attrName, "value"]}
                            rules={[{ required: true }]}
                          >
                            <Select
                              mode="tags"
                              placeholder="Red / M / XL"
                              style={{ width: 200 }}
                            />
                          </Form.Item>

                          <MinusCircleOutlined
                            onClick={() => removeAttr(attrName)}
                          />
                        </Space>
                      ))}

                      <Button
                        type="dashed"
                        onClick={() => addAttr()}
                        icon={<PlusOutlined />}
                      >
                        Add attribute
                      </Button>
                    </>
                  )}
                </Form.List>
              </Card>
            ))}

            <Button type="dashed" onClick={() => add()} icon={<PlusOutlined />}>
              Add Variant
            </Button>
          </div>
        )}
      </Form.List>
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
