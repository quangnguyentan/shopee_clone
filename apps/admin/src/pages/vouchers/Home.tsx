import { useState } from "react";
import dayjs, { type Dayjs } from "dayjs";
import {
  Button,
  DatePicker,
  Form,
  Input,
  InputNumber,
  message,
  Modal,
  Popconfirm,
  Select,
  Space,
  Table,
  Tag,
  Typography,
} from "antd";
import type { ColumnsType } from "antd/es/table";
import { useAppSelector } from "@/common/hooks/useAppSelector";
import { useGetAllShopsQuery } from "@/common/api/shop.api";
import {
  useCreateVoucherMutation,
  useDeleteVoucherMutation,
  useGetVouchersQuery,
  useUpdateVoucherMutation,
  type Voucher,
  type VoucherInput,
  type VoucherScope,
} from "@/common/api/voucher.api";

type VoucherFormValues = Omit<VoucherInput, "starts_at" | "expired_at"> & {
  starts_at?: Dayjs | null;
  expired_at: Dayjs;
};

const currency = new Intl.NumberFormat("vi-VN", {
  style: "currency",
  currency: "VND",
  maximumFractionDigits: 0,
});

export default function VouchersPage() {
  const [form] = Form.useForm<VoucherFormValues>();
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [editing, setEditing] = useState<Voucher | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const role = useAppSelector((state) => state.user.me?.role);
  const isSeller = role === "seller";
  const { data, isLoading } = useGetVouchersQuery({ page, limit });
  const { data: shops } = useGetAllShopsQuery(
    { page: 1, limit: 100 },
    { skip: isSeller || !modalOpen },
  );
  const [createVoucher, createState] = useCreateVoucherMutation();
  const [updateVoucher, updateState] = useUpdateVoucherMutation();
  const [deleteVoucher, deleteState] = useDeleteVoucherMutation();

  const openCreate = () => {
    setEditing(null);
    form.resetFields();
    form.setFieldsValue({
      scope: isSeller ? "shop" : "platform",
      discount_type: "percent",
      min_order_amount: 0,
      expired_at: dayjs().add(7, "day"),
    });
    setModalOpen(true);
  };

  const openEdit = (voucher: Voucher) => {
    setEditing(voucher);
    form.setFieldsValue({
      code: voucher.code,
      scope: voucher.scope,
      shop_id: voucher.shop_id ?? undefined,
      discount_type: voucher.discount_type,
      discount_value: Number(voucher.discount_value),
      starts_at: voucher.starts_at ? dayjs(voucher.starts_at) : null,
      expired_at: dayjs(voucher.expired_at),
      min_order_amount: Number(voucher.min_order_amount),
      max_discount: voucher.max_discount
        ? Number(voucher.max_discount)
        : undefined,
      usage_limit: voucher.usage_limit ?? undefined,
      per_user_limit: voucher.per_user_limit ?? undefined,
    });
    setModalOpen(true);
  };

  const submitForm = async (values: VoucherFormValues) => {
    const body: VoucherInput = {
      ...values,
      scope: isSeller ? "shop" : values.scope,
      shop_id:
        !isSeller && values.scope === "shop"
          ? values.shop_id
          : undefined,
      starts_at: values.starts_at?.toISOString(),
      expired_at: values.expired_at.toISOString(),
    };
    try {
      if (editing) {
        await updateVoucher({ id: editing.id, data: body }).unwrap();
      } else {
        await createVoucher(body).unwrap();
      }
      message.success(`Voucher ${editing ? "updated" : "created"}`);
      setModalOpen(false);
    } catch {
      message.error(`Could not ${editing ? "update" : "create"} voucher`);
    }
  };

  const removeVoucher = async (id: string) => {
    try {
      await deleteVoucher(id).unwrap();
      message.success("Voucher deleted");
    } catch {
      message.error("Could not delete voucher");
    }
  };

  const columns: ColumnsType<Voucher> = [
    { title: "Code", dataIndex: "code", render: (code) => <strong>{code}</strong> },
    {
      title: "Scope",
      dataIndex: "scope",
      render: (scope: VoucherScope) => (
        <Tag color={scope === "shop" ? "blue" : "purple"}>{scope}</Tag>
      ),
    },
    {
      title: "Shop",
      render: (_, voucher) => voucher.shop?.name ?? (voucher.shop_id ?? "—"),
    },
    {
      title: "Discount",
      render: (_, voucher) =>
        voucher.discount_type === "percent"
          ? `${voucher.discount_value}%`
          : currency.format(Number(voucher.discount_value)),
    },
    {
      title: "Usage",
      render: (_, voucher) =>
        `${voucher.usage_count}${voucher.usage_limit ? ` / ${voucher.usage_limit}` : ""}`,
    },
    {
      title: "Expires",
      dataIndex: "expired_at",
      render: (value: string) => dayjs(value).format("DD/MM/YYYY HH:mm"),
    },
    {
      title: "Actions",
      render: (_, voucher) => (
        <Space>
          <Button size="small" onClick={() => openEdit(voucher)}>
            Edit
          </Button>
          <Popconfirm
            title="Delete this voucher?"
            description={
              voucher.usage_count
                ? "Redeemed vouchers cannot be deleted."
                : undefined
            }
            okText="Delete"
            cancelText="Cancel"
            okButtonProps={{ danger: true, disabled: voucher.usage_count > 0 }}
            onConfirm={() => removeVoucher(voucher.id)}
          >
            <Button
              danger
              size="small"
              loading={deleteState.isLoading}
              disabled={voucher.usage_count > 0}
            >
              Delete
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div className="space-y-4">
      <div className="flex items-start justify-between gap-4">
        <div>
          <Typography.Title level={3} className="!mb-1">
            Vouchers
          </Typography.Title>
          <Typography.Text type="secondary">
            {isSeller
              ? "Create and manage vouchers for your shop."
              : "Manage marketplace, shipping, and shop vouchers."}
          </Typography.Text>
        </div>
        <Button type="primary" onClick={openCreate}>
          Create voucher
        </Button>
      </div>

      <Table<Voucher>
        rowKey="id"
        columns={columns}
        dataSource={data?.items ?? []}
        loading={isLoading}
        pagination={{
          current: page,
          pageSize: limit,
          total: data?.total ?? 0,
          showSizeChanger: true,
          onChange: (nextPage, nextLimit) => {
            setPage(nextPage);
            setLimit(nextLimit);
          },
        }}
        scroll={{ x: 900 }}
      />

      <Modal
        title={`${editing ? "Edit" : "Create"} voucher`}
        open={modalOpen}
        onCancel={() => setModalOpen(false)}
        onOk={() => form.submit()}
        confirmLoading={createState.isLoading || updateState.isLoading}
        destroyOnClose
      >
        <Form<VoucherFormValues>
          form={form}
          layout="vertical"
          onFinish={submitForm}
          preserve={false}
        >
          <Form.Item
            name="code"
            label="Voucher code"
            rules={[{ required: true }, { max: 64 }]}
          >
            <Input placeholder="e.g. SAVE10" />
          </Form.Item>
          <Form.Item name="scope" label="Scope" rules={[{ required: true }]}>
            <Select
              disabled={isSeller}
              options={
                isSeller
                  ? [{ value: "shop", label: "Shop" }]
                  : [
                      { value: "platform", label: "Platform" },
                      { value: "shop", label: "Shop" },
                      { value: "shipping", label: "Shipping" },
                    ]
              }
            />
          </Form.Item>
          {!isSeller && (
            <Form.Item
              noStyle
              shouldUpdate={(previous, current) =>
                previous.scope !== current.scope
              }
            >
              {({ getFieldValue }) =>
                getFieldValue("scope") === "shop" ? (
                  <Form.Item
                    name="shop_id"
                    label="Shop"
                    rules={[
                      {
                        required: true,
                        message: "Choose a shop for this voucher",
                      },
                    ]}
                  >
                    <Select
                      showSearch
                      optionFilterProp="label"
                      loading={!shops}
                      options={(shops?.items ?? []).map((shop) => ({
                        value: String(shop.id),
                        label: shop.name,
                      }))}
                    />
                  </Form.Item>
                ) : null
              }
            </Form.Item>
          )}
          <Form.Item
            name="discount_type"
            label="Discount type"
            rules={[{ required: true }]}
          >
            <Select
              options={[
                { value: "percent", label: "Percentage" },
                { value: "fixed", label: "Fixed amount" },
              ]}
            />
          </Form.Item>
          <Form.Item
            name="discount_value"
            label="Discount value"
            rules={[
              { required: true },
              { type: "number", min: 0.01 },
              {
                validator: (_, value: number | undefined) => {
                  if (
                    form.getFieldValue("discount_type") === "percent" &&
                    value !== undefined &&
                    value > 100
                  ) {
                    return Promise.reject(
                      new Error("Percentage cannot exceed 100"),
                    );
                  }
                  return Promise.resolve();
                },
              },
            ]}
          >
            <InputNumber min={0.01} className="w-full" />
          </Form.Item>
          <Form.Item
            name="starts_at"
            label="Starts at (optional)"
            rules={[
              {
                validator: (_, value?: Dayjs | null) => {
                  const expiry = form.getFieldValue("expired_at") as
                    | Dayjs
                    | undefined;
                  if (value && expiry && !value.isBefore(expiry)) {
                    return Promise.reject(
                      new Error("Start date must be before expiry"),
                    );
                  }
                  return Promise.resolve();
                },
              },
            ]}
          >
            <DatePicker showTime className="w-full" />
          </Form.Item>
          <Form.Item
            name="expired_at"
            label="Expires at"
            rules={[{ required: true }]}
          >
            <DatePicker showTime className="w-full" />
          </Form.Item>
          <Form.Item name="min_order_amount" label="Minimum order amount">
            <InputNumber min={0} className="w-full" />
          </Form.Item>
          <Form.Item name="max_discount" label="Maximum discount (optional)">
            <InputNumber min={0} className="w-full" />
          </Form.Item>
          <Form.Item name="usage_limit" label="Total usage limit (optional)">
            <InputNumber min={0} precision={0} className="w-full" />
          </Form.Item>
          <Form.Item name="per_user_limit" label="Per-user limit (optional)">
            <InputNumber min={1} precision={0} className="w-full" />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}
