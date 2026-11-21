import { useEffect } from "react";
import { Button, Form, Input, message, Select, Space } from "antd";
import { useNavigate, useParams } from "react-router-dom";
import Loading from "@/components/Loading";
import {
  useCreateUserMutation,
  useGetUserByIdQuery,
  useUpdateUserMutation,
} from "@/common/api/user.api";
import type { User } from "@/common/types/user.type";

type UserFormValues = Pick<User, "email" | "name" | "phone" | "role" | "status"> & {
  password?: string;
};

export default function FormPage() {
  const { id } = useParams();
  const isEdit = Boolean(id);
  const [form] = Form.useForm<UserFormValues>();
  const navigate = useNavigate();
  const { data: user, isLoading } = useGetUserByIdQuery(id ?? "", {
    skip: !isEdit,
  });
  const [createUser, { isLoading: isCreating }] = useCreateUserMutation();
  const [updateUser, { isLoading: isUpdating }] = useUpdateUserMutation();

  useEffect(() => {
    if (user) {
      form.setFieldsValue({
        email: user.email,
        name: user.name,
        phone: user.phone,
        role: user.role,
        status: user.status,
      });
    }
  }, [form, user]);

  const onFinish = async (values: UserFormValues) => {
    try {
      if (isEdit && id) {
        await updateUser({
          id,
          body: {
            name: values.name,
            phone: values.phone,
            ...(user?.role === "admin" ? {} : { status: values.status }),
          },
        }).unwrap();
      } else {
        await createUser({
          email: values.email,
          password: values.password,
          name: values.name,
          phone: values.phone,
          role: values.role,
          status: values.status,
        }).unwrap();
      }

      message.success(isEdit ? "User updated" : "User created");
      navigate("/users");
    } catch {
      message.error("Could not save this user");
    }
  };

  if (isLoading) return <Loading />;

  return (
    <div className="max-w-2xl">
      <h2 className="mb-5 text-xl font-semibold">
        {isEdit ? "Edit user" : "Create user"}
      </h2>
      <Form
        form={form}
        layout="vertical"
        initialValues={{ role: "seller", status: "PENDING" }}
        onFinish={onFinish}
      >
        <Form.Item
          label="Email"
          name="email"
          rules={[
            { required: true, message: "Enter an email address" },
            { type: "email", message: "Enter a valid email address" },
          ]}
        >
          <Input size="large" disabled={isEdit} />
        </Form.Item>

        {!isEdit && (
          <Form.Item
            label="Temporary password"
            name="password"
            rules={[
              { required: true, message: "Enter a temporary password" },
              { min: 8, message: "Use at least 8 characters" },
            ]}
          >
            <Input.Password size="large" autoComplete="new-password" />
          </Form.Item>
        )}

        <Form.Item
          label="Name"
          name="name"
          rules={[{ required: true, message: "Enter a name" }]}
        >
          <Input size="large" />
        </Form.Item>

        <Form.Item label="Phone" name="phone">
          <Input size="large" />
        </Form.Item>

        <Form.Item
          label="Role"
          name="role"
          rules={[{ required: true, message: "Select a role" }]}
        >
          <Select
            size="large"
            disabled={isEdit}
            options={[
              { label: "Seller", value: "seller" },
              { label: "Buyer", value: "buyer" },
            ]}
          />
        </Form.Item>

        <Form.Item
          label="Account status"
          name="status"
          rules={[{ required: true, message: "Select a status" }]}
        >
          <Select
            size="large"
            disabled={user?.role === "admin"}
            options={[
              { label: "Pending", value: "PENDING" },
              { label: "Active", value: "ACTIVE" },
              { label: "Suspended", value: "SUSPENDED" },
            ]}
          />
        </Form.Item>

        <Form.Item>
          <Space className="flex w-full justify-end">
            <Button onClick={() => navigate("/users")}>Cancel</Button>
            <Button
              type="primary"
              htmlType="submit"
              loading={isCreating || isUpdating}
            >
              {isEdit ? "Save changes" : "Create user"}
            </Button>
          </Space>
        </Form.Item>
      </Form>
    </div>
  );
}
