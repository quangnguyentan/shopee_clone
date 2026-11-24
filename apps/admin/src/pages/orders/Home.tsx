import { useState } from "react";
import { Button, Form, Input, message, Modal, Table, Tag, Typography } from "antd";
import type { ColumnsType } from "antd/es/table";
import {
  useGetOrdersQuery,
  useUpdateSellerOrderStatusMutation,
  type OrderStatus,
  type OrderSummary,
  type ShopOrderSummary,
} from "@/common/api/order.api";
import { useAppSelector } from "@/common/hooks/useAppSelector";
import { convertDay } from "@/common/utils/convertDay";

const nextSellerStatus: Partial<Record<OrderStatus, OrderStatus>> = {
  paid: "processing",
  processing: "shipped",
};

const statusColor: Record<OrderStatus, string> = {
  pending_payment: "orange",
  paid: "blue",
  processing: "geekblue",
  shipped: "cyan",
  completed: "green",
  cancelled: "red",
  refund_pending: "purple",
  refunded: "default",
};
const statusLabel: Record<OrderStatus, string> = {
  pending_payment: "Chờ thanh toán",
  paid: "Đã thanh toán",
  processing: "Đang xử lý",
  shipped: "Đang giao",
  completed: "Hoàn thành",
  cancelled: "Đã hủy",
  refund_pending: "Chờ hoàn tiền",
  refunded: "Đã hoàn tiền",
};

const currency = new Intl.NumberFormat("vi-VN", {
  style: "currency",
  currency: "VND",
  maximumFractionDigits: 0,
});

type ShippingFormValues = {
  carrier: string;
  tracking_number?: string;
};

export default function OrdersPage() {
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const role = useAppSelector((state) => state.user.me?.role);
  const isSeller = role === "seller";
  const [shippingForm] = Form.useForm<ShippingFormValues>();
  const [shippingTarget, setShippingTarget] = useState<{
    id: string | number;
    orderNo: string;
  } | null>(null);
  const { data, isLoading } = useGetOrdersQuery({ page, limit });
  const [updateSellerStatus, sellerUpdate] =
    useUpdateSellerOrderStatusMutation();

  const handleStatusChange = async (
    shopOrderId: string | number,
    status: OrderStatus,
    shipping?: ShippingFormValues,
  ) => {
    try {
      await updateSellerStatus({
        id: shopOrderId,
        status,
        ...shipping,
      }).unwrap();
      message.success("Đã cập nhật trạng thái đơn hàng");
      return true;
    } catch {
      message.error("Không thể cập nhật đơn hàng. Hãy tải lại và thử lại.");
      return false;
    }
  };

  const handleShippingSubmit = async () => {
    if (!shippingTarget) return;
    try {
      const values = await shippingForm.validateFields();
      const updated = await handleStatusChange(
        shippingTarget.id,
        "shipped",
        values,
      );
      if (updated) setShippingTarget(null);
    } catch {
      return;
    }
  };

  const renderAction = (
    id: string | number,
    orderNo: string,
    status: OrderStatus,
  ) => {
    const next = nextSellerStatus[status];
    if (next) {
      return (
        <Button
          type="primary"
          size="small"
          loading={sellerUpdate.isLoading}
          onClick={() => {
            if (next === "shipped") {
              shippingForm.resetFields();
              setShippingTarget({ id, orderNo });
              return;
            }
            void handleStatusChange(id, next);
          }}
        >
          {next === "processing"
            ? "Duyệt & chuẩn bị hàng"
            : "Bàn giao vận chuyển"}
        </Button>
      );
    }

    return (
      <Typography.Text type="secondary">
        {status === "pending_payment"
          ? "Chờ người mua thanh toán"
          : status === "shipped"
            ? "Đang giao — chờ người mua xác nhận"
            : statusLabel[status]}
      </Typography.Text>
    );
  };

  const renderPackage = (shopOrder: ShopOrderSummary) => (
    <div
      key={shopOrder.id}
      className="mb-3 rounded-lg border border-gray-200 bg-white p-4 last:mb-0"
    >
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <Typography.Text strong>{shopOrder.shop_order_no}</Typography.Text>
          {shopOrder.shop?.name && (
            <Typography.Text type="secondary" className="ml-3">
              {shopOrder.shop.name}
            </Typography.Text>
          )}
        </div>
        <div className="flex items-center gap-3">
          <Tag color={statusColor[shopOrder.status]}>
            {statusLabel[shopOrder.status]}
          </Tag>
          {renderAction(
            shopOrder.id,
            shopOrder.shop_order_no,
            shopOrder.status,
          )}
        </div>
      </div>
      {(shopOrder.shippings ?? []).map((shipping) => (
        <div key={shipping.id} className="mt-2 text-sm text-gray-600">
          Vận chuyển: {shipping.carrier || "Chưa chọn hãng"}
          {shipping.tracking_number
            ? ` · Mã vận đơn: ${shipping.tracking_number}`
            : ""}
        </div>
      ))}
      <div className="mt-3 divide-y divide-gray-100">
        {shopOrder.items.map((item) => (
          <div
            key={item.id}
            className="flex flex-wrap justify-between gap-x-6 gap-y-1 py-2 text-sm"
          >
            <span>
              {item.product_name} · {item.sku} × {item.quantity}
            </span>
            <span>{currency.format(Number(item.price) * item.quantity)}</span>
          </div>
        ))}
      </div>
      <Typography.Text type="secondary">
        Tổng gói hàng: {currency.format(Number(shopOrder.total_amount))}
      </Typography.Text>
    </div>
  );

  const columns: ColumnsType<OrderSummary> = [
    {
      title: "Mã đơn",
      dataIndex: "order_no",
      render: (value: string, record) => (
        <div>
          <Typography.Text strong>{value}</Typography.Text>
          {record.shop_order_no && (
            <div className="text-xs text-gray-500">{record.shop_order_no}</div>
          )}
        </div>
      ),
    },
    {
      title: "Người mua",
      render: (_, record) => (
        <div>
          <div>{record.buyer?.name || "—"}</div>
          <Typography.Text type="secondary" className="text-xs">
            {record.buyer?.phone || record.buyer?.email}
          </Typography.Text>
        </div>
      ),
    },
    {
      title: "Gói hàng",
      render: (_, record) => (
        record.shop_orders?.length ??
        (record.items.reduce((total, item) => total + item.quantity, 0) || "—")
      ),
    },
    {
      title: "Tổng tiền",
      dataIndex: "total_amount",
      render: (value: string | number) => currency.format(Number(value)),
    },
    {
      title: "Trạng thái",
      dataIndex: "status",
      render: (status: OrderStatus) => (
        <Tag color={statusColor[status]}>{statusLabel[status]}</Tag>
      ),
    },
    {
      title: "Thanh toán",
      dataIndex: "payment_status",
      render: (status: string | undefined, record) =>
        status === "paid"
          ? "Đã thanh toán"
          : status === "pending"
            ? record.status === "processing" || record.status === "shipped"
              ? "Thanh toán khi nhận hàng"
              : "Chờ thanh toán"
            : status || "—",
    },
    {
      title: "Ngày đặt",
      dataIndex: "created_at",
      render: (value: string) => convertDay(value),
    },
  ];

  return (
    <div className="space-y-4">
      <div>
        <Typography.Title level={3} className="!mb-1">
          Quản lý đơn hàng
        </Typography.Title>
        <Typography.Text type="secondary">
          {isSeller
            ? "Duyệt đơn, chuẩn bị hàng và bàn giao cho đơn vị vận chuyển."
            : "Theo dõi đơn hàng toàn sàn và hỗ trợ xử lý từng gói hàng."}
        </Typography.Text>
      </div>
      <Table<OrderSummary>
        rowKey="id"
        columns={columns}
        dataSource={data?.items ?? []}
        loading={isLoading}
        expandable={{
          expandedRowRender: (record) => (
            <div className="space-y-3">
              {record.shipping_address && (
                <div className="rounded-lg bg-gray-50 p-3 text-sm">
                  <strong>Địa chỉ nhận hàng: </strong>
                  {[
                    record.shipping_address.receiver_name,
                    record.shipping_address.phone,
                    record.shipping_address.address,
                    record.shipping_address.ward_name,
                    record.shipping_address.province_name,
                  ]
                    .filter(
                      (value): value is string =>
                        typeof value === "string" && value.length > 0,
                    )
                    .join(", ") || "Chưa có thông tin"}
                </div>
              )}
              {record.shop_orders?.length
                ? record.shop_orders.map(renderPackage)
                : renderPackage({
                    id: record.id,
                    shop_order_no: record.shop_order_no || record.order_no,
                    shop_id: "",
                    status: record.status,
                    total_amount: record.total_amount,
                    items: record.items,
                    shippings: record.shippings,
                  })}
            </div>
          ),
          rowExpandable: (record) =>
            Boolean(record.shop_orders?.length || record.items.length),
        }}
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
        title="Bàn giao đơn vị vận chuyển"
        open={shippingTarget !== null}
        onCancel={() => setShippingTarget(null)}
        onOk={() => void handleShippingSubmit()}
        confirmLoading={sellerUpdate.isLoading}
        okText="Xác nhận gửi hàng"
        cancelText="Hủy"
      >
        <p className="mb-4 text-sm text-gray-600">
          Đơn {shippingTarget?.orderNo}. Nhập thông tin vận chuyển để người mua
          theo dõi đơn hàng. Hệ thống chưa kết nối API của hãng vận chuyển.
        </p>
        <Form form={shippingForm} layout="vertical">
          <Form.Item
            label="Đơn vị vận chuyển"
            name="carrier"
            rules={[{ required: true, message: "Vui lòng nhập đơn vị vận chuyển" }]}
          >
            <Input placeholder="Ví dụ: GHN, GHTK, Viettel Post" />
          </Form.Item>
          <Form.Item label="Mã vận đơn" name="tracking_number">
            <Input placeholder="Nhập mã vận đơn nếu đã có" />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}
