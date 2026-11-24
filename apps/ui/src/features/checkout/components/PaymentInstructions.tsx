"use client";

import type { CheckoutPayment } from "@/src/common/api/checkout.api";
import { useLanguage } from "@/src/lib/locale";

type PaymentInstructionsProps = {
  orderNo: string;
  payment: CheckoutPayment;
};

const PaymentInstructions = ({
  orderNo,
  payment,
}: PaymentInstructionsProps) => {
  const { language, t } = useLanguage();
  const expiration = payment.expires_at
    ? new Intl.DateTimeFormat(language === "vi" ? "vi-VN" : "en-US", {
        dateStyle: "short",
        timeStyle: "short",
      }).format(new Date(payment.expires_at))
    : null;

  return (
    <>
      {payment.qr_url && (
        <div className="flex flex-col items-center gap-4 rounded border border-gray-200 p-5 sm:flex-row sm:items-start">
          <img
            src={payment.qr_url}
            alt={t("pages.payment.instructions.qr-alt")}
            className="h-56 w-56 border border-gray-100 object-contain"
          />
          <div className="space-y-2 text-sm text-gray-700">
            <p>{t("pages.payment.instructions.qr-description")}</p>
            {payment.bank_account && (
              <>
                <p>
                  {t("pages.payment.instructions.bank")}{" "}
                  <strong>{payment.bank_account.bank_id}</strong>
                </p>
                <p>
                  {t("pages.payment.instructions.account")}{" "}
                  <strong>{payment.bank_account.account_number}</strong>
                </p>
                <p>
                  {t("pages.payment.instructions.account-name")}{" "}
                  <strong>{payment.bank_account.account_name}</strong>
                </p>
                <p>
                  {t("pages.payment.instructions.transfer-content")}{" "}
                  <strong>{orderNo}</strong>
                </p>
              </>
            )}
            {expiration && (
              <p>
                {t("pages.payment.instructions.expires-at", {
                  time: expiration,
                })}
              </p>
            )}
            <p className="text-amber-700">
              {t("pages.payment.instructions.manual-warning")}
            </p>
          </div>
        </div>
      )}
      {payment.method === "cod" && (
        <p className="text-sm text-gray-600">
          {t("pages.payment.instructions.cod")}
        </p>
      )}
    </>
  );
};

export default PaymentInstructions;
