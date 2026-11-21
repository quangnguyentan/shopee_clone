import { useState } from "react";
import { Button, message, Select, Table, Tag, Typography } from "antd";
import type { ColumnsType } from "antd/es/table";
import {
  useGetOrdersQuery,
  useUpdateAdminOrderStatusMutation,
  useUpdateSellerOrderStatusMutation,
  type OrderStatus,
  type OrderSummary,
} from "@/common/api/order.api";
import { useAppSelector } from "@/common/hooks/useAppSelector";
import { convertDay } from "@/common/utils/convertDay";

const statuses: OrderStatus[] = [
  "pending_payment",
  "paid",
  "processing",
  "shipped",
  "completed",
  "cancelled",
  "refund_pending",
  "refunded",
];

const nextSellerStatus: Partial<Record<OrderStatus, OrderStatus>> = {
  paid: "processing",
  processing: "shipped",
  shipped: "completed",
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

const currency = new Intl.NumberFormat("vi-VN", {
  style: "currency",
  currency: "VND",
  maximumFractionDigits: 0,
});

export default function OrdersPage() {
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const role = useAppSelector((state) => state.user.me?.role);
  const isSeller = role === "seller";
  const { data, isLoading } = useGetOrdersQuery({ page, limit });
  const [updateSellerStatus, sellerUpdate] =
    useUpdateSellerOrderStatusMutation();
  const [updateAdminStatus, adminUpdate] =
    useUpdateAdminOrderStatusMutation();

  const handleStatusChange = async (
    order: OrderSummary,
    status: OrderStatus,
  ) => {
    try {
      if (isSeller) {
        await updateSellerStatus({ id: order.id, status }).unwrap();
      } else {
        await updateAdminStatus({ id: order.id, status }).unwrap();
      }
      message.success("Order status updated");
    } catch {
      message.error("Could not update order status");
    }
  };

  const columns: ColumnsType<OrderSummary> = [
    {
      title: "Order",
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
      title: "Buyer",
      render: (_, record) => record.buyer?.name || "—",
    },
    {
      title: "Items",
      dataIndex: "items",
      render: (items: OrderSummary["items"]) =>
        items.reduce((total, item) => total + item.quantity, 0),
    },
    {
      title: "Total",
      dataIndex: "total_amount",
      render: (value: string | number) => currency.format(Number(value)),
    },
    {
      title: "Status",
      dataIndex: "status",
      render: (status: OrderStatus) => (
        <Tag color={statusColor[status]}>{status.replaceAll("_", " ")}</Tag>
      ),
    },
    {
      title: "Created",
      dataIndex: "created_at",
      render: (value: string) => convertDay(value),
    },
    {
      title: "Actions",
      render: (_, record) => {
        if (isSeller) {
          const next = nextSellerStatus[record.status];
          return next ? (
            <Button
              type="primary"
              size="small"
              loading={sellerUpdate.isLoading}
              onClick={() => handleStatusChange(record, next)}
            >
              Mark {next.replaceAll("_", " ")}
            </Button>
          ) : null;
        }

        return (
          <Select
            value={record.status}
            style={{ minWidth: 150 }}
            loading={adminUpdate.isLoading}
            options={statuses.map((status) => ({
              label: status.replaceAll("_", " "),
              value: status,
            }))}
            onChange={(status: OrderStatus) =>
              handleStatusChange(record, status)
            }
          />
        );
      },
    },
  ];

  return (
    <div className="space-y-4">
      <div>
        <Typography.Title level={3} className="!mb-1">
          Orders
        </Typography.Title>
        <Typography.Text type="secondary">
          {isSeller
            ? "View and fulfill orders for your shop only."
            : "Review marketplace orders and manage their status."}
        </Typography.Text>
      </div>
      <Table<OrderSummary>
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
    </div>
  );
}
