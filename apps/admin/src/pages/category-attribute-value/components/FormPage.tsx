import { Button, Form, Input, Space, message } from "antd";
import { useNavigate, useParams } from "react-router-dom";
import { useEffect } from "react";
import Loading from "@/components/Loading";
import {
  useCreateCategoryAttributeValueMutation,
  useGetCategoryAttributeValueByIdQuery,
  useUpdateCategoryAttributeValueMutation,
} from "@/common/api/category-attribute-value.api";

type FormValues = {
  value: string;
};

const CategoryAttributeValueFormPage = () => {
  const { attributeId, id } = useParams();
  const isEdit = !!id;
  const navigate = useNavigate();
  const [form] = Form.useForm<FormValues>();

  const { data, isLoading } = useGetCategoryAttributeValueByIdQuery(
    { id },
    { skip: !isEdit },
  );

  const [create] = useCreateCategoryAttributeValueMutation();
  const [update] = useUpdateCategoryAttributeValueMutation();

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
        await create({
          value: values.value,
          attribute_id: Number(attributeId),
        }).unwrap();
      }
      message.success("Saved successfully");
      navigate(-1);
    } catch {
      message.error("Submit failed");
    }
  };

  if (isLoading) return <Loading />;

  return (
    <Form layout="vertical" form={form} onFinish={onFinish}>
      <h2 className="text-xl font-semibold mb-4">
        {isEdit ? "Edit Attribute Value" : "Create Attribute Value"}
      </h2>

      <Form.Item label="Value" name="value" rules={[{ required: true }]}>
        <Input />
      </Form.Item>

      <Space className="flex justify-end">
        <Button onClick={() => navigate(-1)}>Cancel</Button>
        <Button type="primary" htmlType="submit">
          Save
        </Button>
      </Space>
    </Form>
  );
};

export default CategoryAttributeValueFormPage;
