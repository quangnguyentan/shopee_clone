"use client";

import Link from "next/link";
import { useLanguage } from "@/src/lib/locale";

type PaymentResultContentProps = {
  orderNo?: string;
  succeeded: boolean;
};

const PaymentResultContent = ({
  orderNo,
  succeeded,
}: PaymentResultContentProps) => {
  const { t } = useLanguage();

  return (
    <section className="mx-auto max-w-2xl bg-white px-5 py-12 text-center sm:px-10">
      <h1 className="text-2xl font-medium text-gray-800">
        {t(
          succeeded
            ? "pages.payment.result.success-title"
            : "pages.payment.result.pending-title",
        )}
      </h1>
      <p className="mt-3 text-sm text-gray-600">
        {t(
          succeeded
            ? "pages.payment.result.success-message"
            : "pages.payment.result.pending-message",
        )}
      </p>
      {orderNo && (
        <p className="mt-3 text-sm text-gray-600">
          {t("pages.payment.result.order-number")}: <strong>{orderNo}</strong>
        </p>
      )}
      <div className="mt-7 flex flex-wrap justify-center gap-3">
        <Link
          href="/user/purchase"
          className="rounded-sm bg-red-primary px-6 py-3 text-sm text-white"
        >
          {t("pages.payment.result.my-orders")}
        </Link>
        <Link
          href="/"
          className="rounded-sm border border-gray-300 px-6 py-3 text-sm text-gray-700"
        >
          {t("pages.payment.result.continue-shopping")}
        </Link>
      </div>
    </section>
  );
};

export default PaymentResultContent;
