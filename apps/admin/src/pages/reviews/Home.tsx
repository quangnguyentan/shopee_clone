import { useState } from "react";
import dayjs from "dayjs";
import {
  Button,
  Input,
  message,
  Popconfirm,
  Rate,
  Table,
  Typography,
} from "antd";
import type { ColumnsType } from "antd/es/table";
import {
  useDeleteProductReviewMutation,
  useGetManagedProductReviewsQuery,
  useUpdateProductReviewReplyMutation,
  type ProductReview,
} from "@/common/api/product-review.api";
import { useAppSelector } from "@/common/hooks/useAppSelector";

export default function ReviewsPage() {
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [drafts, setDrafts] = useState<Record<string, string>>({});
  const role = useAppSelector((state) => state.user.me?.role);
  const isSeller = role === "seller";
  const { data, isLoading } = useGetManagedProductReviewsQuery({ page, limit });
  const [updateReply, replyState] = useUpdateProductReviewReplyMutation();
  const [deleteReview, deleteState] = useDeleteProductReviewMutation();

  const saveReply = async (review: ProductReview) => {
    try {
      await updateReply({
        id: review.id,
        shop_reply: drafts[review.id] ?? review.shop_reply ?? "",
      }).unwrap();
      setDrafts((current) => {
        const next = { ...current };
        delete next[review.id];
        return next;
      });
      message.success("Reply saved");
    } catch {
      message.error("Could not save reply");
    }
  };

  const removeReview = async (id: string) => {
    try {
      await deleteReview(id).unwrap();
      message.success("Review deleted");
    } catch {
      message.error("Could not delete review");
    }
  };

  const columns: ColumnsType<ProductReview> = [
    {
      title: "Product",
      render: (_, review) => review.product?.name ?? `#${review.product_id}`,
    },
    {
      title: "Buyer",
      render: (_, review) => review.user?.name || "Buyer",
    },
    {
      title: "Rating",
      dataIndex: "rating",
      render: (rating: number) => <Rate disabled value={rating} />,
    },
    {
      title: "Review",
      dataIndex: "comment",
      render: (comment: string | null) => comment || "No written comment",
    },
    {
      title: "Shop reply",
      render: (_, review) => (
        <div className="min-w-64 space-y-2">
          <Input.TextArea
            rows={2}
            maxLength={2000}
            placeholder="Write a reply to the buyer"
            value={drafts[review.id] ?? review.shop_reply ?? ""}
            onChange={(event) =>
              setDrafts((current) => ({
                ...current,
                [review.id]: event.target.value,
              }))
            }
          />
          <Button
            size="small"
            type="primary"
            loading={replyState.isLoading}
            onClick={() => saveReply(review)}
          >
            Save reply
          </Button>
        </div>
      ),
    },
    {
      title: "Created",
      dataIndex: "created_at",
      render: (value: string) => dayjs(value).format("DD/MM/YYYY HH:mm"),
    },
    ...(!isSeller
      ? [
          {
            title: "Actions",
            render: (_: unknown, review: ProductReview) => (
              <Popconfirm
                title="Delete this review?"
                okText="Delete"
                cancelText="Cancel"
                okButtonProps={{ danger: true }}
                onConfirm={() => removeReview(review.id)}
              >
                <Button danger size="small" loading={deleteState.isLoading}>
                  Delete
                </Button>
              </Popconfirm>
            ),
          } satisfies ColumnsType<ProductReview>[number],
        ]
      : []),
  ];

  return (
    <div className="space-y-4">
      <div>
        <Typography.Title level={3} className="!mb-1">
          Product reviews
        </Typography.Title>
        <Typography.Text type="secondary">
          {isSeller
            ? "Read and reply to reviews for products in your shop."
            : "Review customer feedback and manage shop replies."}
        </Typography.Text>
      </div>
      <Table<ProductReview>
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
        scroll={{ x: 1200 }}
      />
    </div>
  );
}
