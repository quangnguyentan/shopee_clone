"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  useCompleteMyShopOrderMutation,
  useGetMyOrdersQuery,
  useRetryOrderPaymentMutation,
  type OrderPaymentStatus,
  type OrderStatus,
} from "@/src/common/api/order.api";
import { useAppSelector } from "@/src/common/hooks/useAppSelector";
import { formatCurrency } from "@/src/common/helper/formatCurrency";
import { getAssetUrl } from "@/src/lib/assets";
import type { CheckoutPayment } from "@/src/common/api/checkout.api";
import PaymentInstructions from "@/src/features/checkout/components/PaymentInstructions";
import ProductReviewModal, {
  type ProductReviewTarget,
} from "@/src/features/product/components/ProductReviewModal";
import { useGetMyReviewedOrderItemsQuery } from "@/src/common/api/product-review.api";
import type { I18nKeys } from "@/src/lib/locale";
import { useLanguage } from "@/src/lib/locale";

const orderFilters: Array<{ label: I18nKeys; status?: OrderStatus }> = [
  { label: "pages.purchase.filters.all" },
  {
    label: "pages.purchase.filters.pending_payment",
    status: "pending_payment",
  },
  { label: "pages.purchase.filters.processing", status: "processing" },
  { label: "pages.purchase.filters.shipped", status: "shipped" },
  { label: "pages.purchase.filters.completed", status: "completed" },
  { label: "pages.purchase.filters.cancelled", status: "cancelled" },
];

const statusTranslationKeys: Record<OrderStatus, I18nKeys> = {
  pending_payment: "pages.purchase.status.pending_payment",
  paid: "pages.purchase.status.paid",
  processing: "pages.purchase.status.processing",
  shipped: "pages.purchase.status.shipped",
  completed: "pages.purchase.status.completed",
  cancelled: "pages.purchase.status.cancelled",
  refund_pending: "pages.purchase.status.refund_pending",
  refunded: "pages.purchase.status.refunded",
};

const paymentStatusTranslationKeys: Record<OrderPaymentStatus, I18nKeys> = {
  pending: "pages.purchase.payment.pending",
  paid: "pages.purchase.payment.paid",
  failed: "pages.purchase.payment.failed",
  refunded: "pages.purchase.payment.refunded",
  partially_refunded: "pages.purchase.payment.partially_refunded",
};

const PurchasePage = () => {
  const { language, t } = useLanguage();
  const router = useRouter();
  const isAuthenticated = useAppSelector((state) => state.auth.isAuthenticated);
  const [status, setStatus] = useState<OrderStatus | undefined>();
  const [page, setPage] = useState(1);
  const { data, isLoading, isFetching, isError } = useGetMyOrdersQuery(
    { page, limit: 10, status },
    { skip: !isAuthenticated },
  );
  const [retryOrderPayment, { isLoading: isRetrying }] =
    useRetryOrderPaymentMutation();
  const [completeMyShopOrder] = useCompleteMyShopOrderMutation();
  const [completingShopOrderId, setCompletingShopOrderId] = useState<
    string | null
  >(null);
  const [receiptTarget, setReceiptTarget] = useState<{
    id: string;
    shopName: string;
  } | null>(null);
  const [retryPayment, setRetryPayment] = useState<{
    orderNo: string;
    payment: CheckoutPayment;
  } | null>(null);
  const [reviewTarget, setReviewTarget] =
    useState<ProductReviewTarget | null>(null);
  const { data: reviewedOrderItemIds = [] } = useGetMyReviewedOrderItemsQuery(
    undefined,
    { skip: !isAuthenticated },
  );
  const reviewedOrderItemSet = new Set(reviewedOrderItemIds);

  const handleRetryPayment = async (orderId: string, orderNo: string) => {
    try {
      const payment = await retryOrderPayment(orderId).unwrap();
      if (payment.redirect_url) {
        window.location.assign(payment.redirect_url);
        return;
      }
      setRetryPayment({ orderNo, payment });
    } catch (error) {
      const data =
        error && typeof error === "object" && "data" in error
          ? error.data
          : undefined;
      const errorMessage =
        data && typeof data === "object" && "message" in data
          ? data.message
          : undefined;
      const message = Array.isArray(errorMessage)
        ? errorMessage.join(", ")
        : typeof errorMessage === "string"
          ? errorMessage
          : t("pages.purchase.pay.error");
      toast.error(message);
    }
  };

  const handleConfirmReceipt = async () => {
    if (!receiptTarget) return;

    setCompletingShopOrderId(receiptTarget.id);
    try {
      await completeMyShopOrder(receiptTarget.id).unwrap();
      toast.success(t("pages.purchase.receive.success"));
      setReceiptTarget(null);
    } catch {
      toast.error(t("pages.purchase.receive.error"));
    } finally {
      setCompletingShopOrderId(null);
    }
  };

  if (!isAuthenticated) {
    return (
      <section className="bg-white p-10 text-center">
        <p className="text-gray-700">{t("pages.purchase.login.message")}</p>
        <button
          type="button"
          onClick={() =>
            router.push(
              `/buyer/login?redirect=${encodeURIComponent("/user/purchase")}`,
            )
          }
          className="mt-4 rounded-sm bg-red-primary px-6 py-2 text-sm text-white"
        >
          {t("pages.purchase.login.button")}
        </button>
      </section>
    );
  }

  return (
    <section className="space-y-4">
      {reviewTarget && (
        <ProductReviewModal
          key={reviewTarget.orderItemId}
          target={reviewTarget}
          onClose={() => setReviewTarget(null)}
        />
      )}
      {receiptTarget && (
        <div
          className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 p-4"
          role="presentation"
          onMouseDown={(event) => {
            if (
              event.target === event.currentTarget &&
              completingShopOrderId !== receiptTarget.id
            ) {
              setReceiptTarget(null);
            }
          }}
        >
          <section
            role="dialog"
            aria-modal="true"
            aria-labelledby="receive-order-title"
            className="w-full max-w-md rounded-sm bg-white shadow-xl"
          >
            <header className="flex items-start gap-3 border-b border-gray-100 px-5 py-4">
              <span
                aria-hidden="true"
                className="flex size-9 shrink-0 items-center justify-center rounded-full bg-red-50 text-lg font-semibold text-red-primary"
              >
                ✓
              </span>
              <div className="min-w-0 flex-1">
                <h2
                  id="receive-order-title"
                  className="text-base font-medium text-gray-800"
                >
                  {t("pages.purchase.receive.title")}
                </h2>
                <p className="mt-1 text-sm text-gray-600">
                  {t("pages.purchase.receive.description")}
                </p>
              </div>
              <button
                type="button"
                aria-label={t("pages.purchase.receive.close")}
                disabled={completingShopOrderId === receiptTarget.id}
                onClick={() => setReceiptTarget(null)}
                className="rounded px-2 text-xl leading-none text-gray-400 hover:bg-gray-100 hover:text-gray-700 disabled:opacity-50"
              >
                ×
              </button>
            </header>
            <div className="px-5 py-4">
              <p className="text-sm text-gray-700">
                {receiptTarget.shopName}
              </p>
            </div>
            <footer className="flex justify-end gap-3 border-t border-gray-100 bg-gray-50 px-5 py-4">
              <button
                type="button"
                disabled={completingShopOrderId === receiptTarget.id}
                onClick={() => setReceiptTarget(null)}
                className="rounded-sm border border-gray-300 bg-white px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 disabled:opacity-50"
              >
                {t("pages.purchase.receive.cancel")}
              </button>
              <button
                type="button"
                disabled={completingShopOrderId === receiptTarget.id}
                onClick={() => void handleConfirmReceipt()}
                className="rounded-sm bg-red-primary px-4 py-2 text-sm text-white hover:bg-red-600 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {completingShopOrderId === receiptTarget.id
                  ? t("pages.purchase.receive.loading")
                  : t("pages.purchase.receive.confirm-button")}
              </button>
            </footer>
          </section>
        </div>
      )}
      {retryPayment && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
          role="presentation"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) setRetryPayment(null);
          }}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="retry-payment-title"
            className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded bg-white p-5 shadow-xl"
          >
            <div className="mb-5 flex items-center justify-between gap-4">
              <h2
                id="retry-payment-title"
                className="text-lg font-medium text-gray-800"
              >
                {t("pages.purchase.retry.title")}
              </h2>
              <button
                type="button"
                onClick={() => setRetryPayment(null)}
                className="rounded px-3 py-1 text-sm text-gray-600 hover:bg-gray-100"
              >
                {t("pages.purchase.retry.close")}
              </button>
            </div>
            <PaymentInstructions
              payment={retryPayment.payment}
              orderNo={retryPayment.orderNo}
            />
          </div>
        </div>
      )}
      <header className="bg-white px-5 pt-4">
        <h1 className="text-lg font-medium text-gray-800">
          {t("pages.purchase.title")}
        </h1>
        <nav
          aria-label={t("pages.purchase.filter-label")}
          className="mt-4 flex overflow-x-auto border-b border-gray-200"
        >
          {orderFilters.map((filter) => (
            <button
              key={filter.label}
              type="button"
              onClick={() => {
                setStatus(filter.status);
                setPage(1);
              }}
              aria-current={status === filter.status ? "page" : undefined}
              className={`shrink-0 border-b-2 px-4 py-3 text-sm ${
                status === filter.status
                  ? "border-red-primary text-red-primary"
                  : "border-transparent text-gray-600 hover:text-red-primary"
              }`}
            >
              {t(filter.label)}
            </button>
          ))}
        </nav>
      </header>

      {isLoading || isFetching ? (
        <div className="h-52 animate-pulse bg-white" />
      ) : isError ? (
        <p role="alert" className="bg-white p-8 text-center text-red-primary">
          {t("pages.purchase.error.load")}
        </p>
      ) : !data?.items.length ? (
        <div className="bg-white px-4 py-16 text-center">
          <p className="text-gray-600">{t("pages.purchase.empty")}</p>
          <Link
            href="/"
            className="mt-4 inline-block rounded-sm bg-red-primary px-6 py-2 text-sm text-white"
          >
            {t("pages.purchase.discover")}
          </Link>
        </div>
      ) : (
        <>
          <div className="space-y-3">
            {data.items.map((order) => (
              <article key={order.id} className="bg-white">
                <header className="flex flex-wrap items-center justify-between gap-2 border-b border-gray-100 px-5 py-4">
                  <div>
                    <p className="text-sm font-medium text-gray-800">
                      {t("pages.purchase.order-number", {
                        number: order.order_no,
                      })}
                    </p>
                    <p className="mt-1 text-xs text-gray-500">
                      {new Intl.DateTimeFormat(
                        language === "vi" ? "vi-VN" : "en-US",
                        {
                          dateStyle: "medium",
                          timeStyle: "short",
                        },
                      ).format(new Date(order.created_at))}
                    </p>
                  </div>
                  <span className="text-sm text-red-primary">
                    {t(statusTranslationKeys[order.status])}
                  </span>
                </header>

                <div className="divide-y divide-gray-100">
                  {order.shop_orders.map((shopOrder) => (
                    <section key={shopOrder.id}>
                      <div className="flex flex-wrap items-center justify-between gap-2 px-5 py-3 text-sm text-gray-700">
                        <div className="flex items-center gap-2">
                          <span aria-hidden="true">▣</span>
                          <span>{shopOrder.shop_name}</span>
                          <span className="text-red-primary">
                            {t(statusTranslationKeys[shopOrder.status])}
                          </span>
                        </div>
                        {shopOrder.status === "shipped" && (
                          <button
                            type="button"
                            disabled={completingShopOrderId === shopOrder.id}
                            onClick={() =>
                              setReceiptTarget({
                                id: shopOrder.id,
                                shopName: shopOrder.shop_name,
                              })
                            }
                            className="rounded-sm bg-red-primary px-4 py-2 text-xs text-white disabled:opacity-50"
                          >
                            {completingShopOrderId === shopOrder.id
                              ? t("pages.purchase.receive.loading")
                              : t("pages.purchase.receive.button")}
                          </button>
                        )}
                      </div>
                      {(shopOrder.shippings ?? []).map((shipment) => (
                        <div
                          key={shipment.id}
                          className="px-5 pb-3 text-xs text-gray-500"
                        >
                          {shipment.carrier
                            ? `${t("pages.purchase.shipping.carrier")}: ${shipment.carrier}`
                            : ""}
                          {shipment.tracking_number
                            ? ` · ${t("pages.purchase.shipping.tracking")}: ${shipment.tracking_number}`
                            : ""}
                        </div>
                      ))}
                      {shopOrder.items.map((item) => {
                        const imageUrl = getAssetUrl(item.image_url);
                        return (
                          <div
                            key={item.id}
                            className="flex items-center gap-3 px-5 py-3"
                          >
                            <div className="relative h-16 w-16 shrink-0 border border-gray-100 bg-gray-50">
                              {imageUrl && (
                                <Image
                                  src={imageUrl}
                                  alt={item.product_name}
                                  fill
                                  unoptimized
                                  sizes="64px"
                                  className="object-cover"
                                />
                              )}
                            </div>
                            <div className="min-w-0 flex-1">
                              {item.product_id ? (
                                <Link
                                  href={`/product/${item.product_id}`}
                                  className="line-clamp-2 text-sm text-gray-800 hover:text-red-primary"
                                >
                                  {item.product_name}
                                </Link>
                              ) : (
                                <p className="line-clamp-2 text-sm text-gray-800">
                                  {item.product_name}
                                </p>
                              )}
                              {item.variant_label && (
                                <p className="mt-1 text-xs text-gray-500">
                                  {t("pages.purchase.variant", {
                                    label: item.variant_label,
                                  })}
                                </p>
                              )}
                              <p className="mt-1 text-xs text-gray-500">
                                {t("pages.purchase.quantity", {
                                  count: item.quantity,
                                })}
                              </p>
                              {shopOrder.status === "completed" &&
                                item.product_id &&
                                (reviewedOrderItemSet.has(item.id) ? (
                                  <span className="mt-2 inline-block text-xs text-green-700">
                                    {t("pages.purchase.review.done")}
                                  </span>
                                ) : (
                                  <button
                                    type="button"
                                    onClick={() => {
                                      if (!item.product_id) return;
                                      setReviewTarget({
                                        orderItemId: item.id,
                                        productId: item.product_id,
                                        productName: item.product_name,
                                        imageUrl: item.image_url,
                                        variantLabel: item.variant_label,
                                      })
                                    }}
                                    className="mt-2 text-xs text-red-primary hover:underline"
                                  >
                                    {t("pages.purchase.review.button")}
                                  </button>
                                ))}
                            </div>
                            <p className="whitespace-nowrap text-sm text-gray-700">
                              ₫{formatCurrency(Number(item.price))}
                            </p>
                          </div>
                        );
                      })}
                    </section>
                  ))}
                </div>

                <footer className="flex flex-wrap items-center justify-between gap-3 border-t border-gray-100 px-5 py-4">
                  <span className="text-sm text-gray-500">
                    {t("pages.purchase.payment-status", {
                      status:
                        order.payment_status === "pending" &&
                        order.status !== "pending_payment"
                          ? t("pages.purchase.payment.cod_pending")
                          : t(
                              paymentStatusTranslationKeys[
                                order.payment_status
                              ],
                            ),
                    })}
                  </span>
                  <p className="text-sm text-gray-700">
                    {t("pages.purchase.total")}{" "}
                    <strong className="text-xl font-medium text-red-primary">
                      ₫{formatCurrency(Number(order.total_amount))}
                    </strong>
                  </p>
                  {order.status === "pending_payment" &&
                    order.payment_status === "pending" && (
                      <button
                        type="button"
                        disabled={isRetrying}
                        onClick={() =>
                          void handleRetryPayment(order.id, order.order_no)
                        }
                        className="rounded-sm bg-red-primary px-4 py-2 text-sm text-white disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        {isRetrying
                          ? t("pages.purchase.pay.loading")
                          : t("pages.purchase.pay")}
                      </button>
                    )}
                </footer>
              </article>
            ))}
          </div>

          <div className="flex items-center justify-center gap-4 py-3">
            <button
              type="button"
              disabled={page <= 1}
              onClick={() => setPage((current) => current - 1)}
              className="rounded border border-gray-300 px-4 py-2 text-sm text-gray-700 disabled:opacity-40"
            >
              {t("pages.purchase.pagination.previous")}
            </button>
            <span className="text-sm text-gray-600">
              {t("pages.purchase.pagination.page", {
                page: data.page,
                total: Math.max(1, Math.ceil(data.total / data.limit)),
              })}
            </span>
            <button
              type="button"
              disabled={page * data.limit >= data.total}
              onClick={() => setPage((current) => current + 1)}
              className="rounded border border-gray-300 px-4 py-2 text-sm text-gray-700 disabled:opacity-40"
            >
              {t("pages.purchase.pagination.next")}
            </button>
          </div>
        </>
      )}
    </section>
  );
};

export default PurchasePage;
