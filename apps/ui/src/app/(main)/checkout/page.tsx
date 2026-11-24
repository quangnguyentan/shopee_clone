"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  useCreateCheckoutOrderMutation,
  useGetCheckoutPaymentMethodsQuery,
  useGetVietnamProvincesQuery,
  useGetVietnamWardsQuery,
  type CheckoutPaymentMethod,
  type CheckoutResult,
} from "@/src/common/api/checkout.api";
import { useGetMyCartQuery } from "@/src/common/api/cart.api";
import { useGetMeQuery } from "@/src/common/api/user.api";
import { useAppSelector } from "@/src/common/hooks/useAppSelector";
import type { I18nKeys } from "@/src/lib/locale";
import { useLanguage } from "@/src/lib/locale";
import { formatCurrency } from "@/src/common/helper/formatCurrency";
import { getAssetUrl } from "@/src/lib/assets";
import PaymentInstructions from "@/src/features/checkout/components/PaymentInstructions";

const getApiError = (error: unknown, fallback: string) => {
  if (!error || typeof error !== "object" || !("data" in error)) {
    return fallback;
  }
  const { data } = error as { data?: { message?: string | string[] } };
  const message = data?.message;
  return Array.isArray(message) ? message.join(", ") : message || fallback;
};

const paymentMethodTranslationKeys: Record<
  CheckoutPaymentMethod,
  { label: I18nKeys; description: I18nKeys }
> = {
  vnpay: {
    label: "pages.checkout.payment.methods.vnpay.label",
    description: "pages.checkout.payment.methods.vnpay.description",
  },
  momo: {
    label: "pages.checkout.payment.methods.momo.label",
    description: "pages.checkout.payment.methods.momo.description",
  },
  vietqr_manual: {
    label: "pages.checkout.payment.methods.vietqr_manual.label",
    description: "pages.checkout.payment.methods.vietqr_manual.description",
  },
  cod: {
    label: "pages.checkout.payment.methods.cod.label",
    description: "pages.checkout.payment.methods.cod.description",
  },
};

const CheckoutPage = () => {
  const router = useRouter();
  const { t } = useLanguage();
  const isAuthenticated = useAppSelector((state) => state.auth.isAuthenticated);
  const {
    data: cart,
    isLoading: isCartLoading,
    isError: isCartError,
  } = useGetMyCartQuery(undefined, { skip: !isAuthenticated });
  const { data: profile } = useGetMeQuery(undefined, {
    skip: !isAuthenticated,
  });
  const {
    data: provinces,
    isLoading: isProvincesLoading,
    isError: isProvincesError,
  } = useGetVietnamProvincesQuery();
  const {
    data: paymentMethods,
    isLoading: isMethodsLoading,
    isError: isMethodsError,
  } = useGetCheckoutPaymentMethodsQuery();
  const [createOrder, { isLoading: isSubmitting }] =
    useCreateCheckoutOrderMutation();

  const [receiverName, setReceiverName] = useState("");
  const [phone, setPhone] = useState("");
  const [provinceCode, setProvinceCode] = useState("");
  const [wardCode, setWardCode] = useState("");
  const [streetAddress, setStreetAddress] = useState("");
  const [paymentMethod, setPaymentMethod] =
    useState<CheckoutPaymentMethod>("cod");
  const [result, setResult] = useState<CheckoutResult | null>(null);
  const [selectedItemIds, setSelectedItemIds] = useState<string[] | null>(null);

  const selectedProvince = provinces?.find(
    (province) => province.code === Number(provinceCode),
  );
  const {
    data: provinceWards,
    isLoading: isProvinceWardsLoading,
    isError: isProvinceWardsError,
  } = useGetVietnamWardsQuery(Number(provinceCode), {
    skip: !provinceCode,
  });
  const items = cart?.items ?? [];
  const selectedWard = provinceWards?.find(
    (ward) => ward.code === Number(wardCode),
  );
  const checkoutItems =
    selectedItemIds !== null
      ? items.filter((item) => selectedItemIds.includes(String(item.id)))
      : items;
  const invalidSelection =
    selectedItemIds !== null &&
    (selectedItemIds.length === 0 ||
      checkoutItems.length !== selectedItemIds.length);
  const subtotal = checkoutItems.reduce(
    (sum, item) => sum + item.product_variant.price * item.quantity,
    0,
  );
  const enabledMethods =
    paymentMethods?.filter((method) => method.enabled) ?? [];

  useEffect(() => {
    if (profile) {
      setReceiverName((current) => current || profile.name || "");
      setPhone((current) => current || profile.phone || "");
    }
  }, [profile]);

  useEffect(() => {
    const urlItems = new URLSearchParams(window.location.search).get("items");
    if (urlItems) {
      setSelectedItemIds([
        ...new Set(urlItems.split(",").filter((id) => /^\d+$/.test(id))),
      ]);
    }
  }, []);

  useEffect(() => {
    if (
      paymentMethods?.length &&
      !paymentMethods.some(
        (method) => method.enabled && method.id === paymentMethod,
      )
    ) {
      const firstEnabled = paymentMethods.find((method) => method.enabled);
      if (firstEnabled) setPaymentMethod(firstEnabled.id);
    }
  }, [paymentMethods, paymentMethod]);

  const handleProvinceChange = (value: string) => {
    setProvinceCode(value);
    setWardCode("");
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const province = provinces?.find(
      (item) => item.code === Number(provinceCode),
    );
    const ward = provinceWards?.find((item) => item.code === Number(wardCode));
    if (!province || !ward) {
      toast.error(t("pages.checkout.address.select-location-error"));
      return;
    }

    try {
      const checkout = await createOrder({
        shipping_address: {
          receiver_name: receiverName.trim(),
          phone: phone.trim(),
          province_code: province.code,
          province_name: province.name,
          ward_code: ward.code,
          ward_name: ward.name,
          address: streetAddress.trim(),
        },
        payment_method: paymentMethod,
        ...(selectedItemIds !== null
          ? { selected_item_ids: selectedItemIds }
          : {}),
      }).unwrap();
      setResult(checkout);
      if (checkout.payment.redirect_url) {
        window.location.assign(checkout.payment.redirect_url);
      } else {
        toast.success(t("pages.checkout.toast.created"));
      }
    } catch (error) {
      toast.error(getApiError(error, t("pages.checkout.error.create")));
    }
  };

  if (!isAuthenticated) {
    return (
      <section className="bg-white px-4 py-16 text-center">
        <p className="text-gray-700">{t("pages.checkout.login.message")}</p>
        <button
          type="button"
          onClick={() => router.push("/buyer/login")}
          className="mt-4 rounded-sm bg-red-primary px-6 py-2 text-sm text-white"
        >
          {t("pages.checkout.login.button")}
        </button>
      </section>
    );
  }

  if (isCartLoading) {
    return <div className="h-56 animate-pulse bg-white" />;
  }

  if (isCartError) {
    return (
      <p role="alert" className="bg-white p-8 text-center text-red-primary">
        {t("pages.checkout.error.cart")}
      </p>
    );
  }

  if (result) {
    return (
      <section className="mx-auto max-w-3xl space-y-5 bg-white p-6 sm:p-10">
        <div>
          <h1 className="text-2xl font-medium text-gray-800">
            {result.payment.method === "vietqr_manual"
              ? t("pages.checkout.result.vietqr-title")
              : t("pages.checkout.result.success-title")}
          </h1>
          <p className="mt-2 text-sm text-gray-600">
            {t("pages.checkout.result.order-number")}:{" "}
            <strong>{result.order.order_no}</strong>
          </p>
          <p className="mt-1 text-sm text-gray-600">
            {t("pages.checkout.result.total")}:{" "}
            <strong className="text-red-primary">
              ₫{formatCurrency(Number(result.order.total_amount))}
            </strong>
          </p>
        </div>

        <PaymentInstructions
          payment={result.payment}
          orderNo={result.order.order_no}
        />
        <Link
          href="/user/purchase"
          className="inline-flex rounded-sm bg-red-primary px-6 py-3 text-sm text-white"
        >
          {t("pages.checkout.result.view-orders")}
        </Link>
      </section>
    );
  }

  if (checkoutItems.length === 0) {
    return (
      <section className="bg-white px-4 py-16 text-center">
        <p className="text-gray-700">
          {items.length > 0
            ? t("pages.checkout.empty.selection-missing")
            : t("pages.checkout.empty.cart")}
        </p>
        <Link
          href="/cart"
          className="mt-4 inline-block text-sm text-red-primary"
        >
          {t("pages.checkout.empty.back-cart")}
        </Link>
      </section>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="mx-auto max-w-screen-xl space-y-5 pb-10"
    >
      <h1 className="text-xl font-medium text-gray-800">
        {t("pages.checkout.title")}
      </h1>

      <section className="space-y-4 bg-white p-5">
        <h2 className="font-medium text-red-primary">
          {t("pages.checkout.address.title")}
        </h2>
        <div className="grid gap-3 sm:grid-cols-2">
          <label className="space-y-1 text-sm text-gray-600">
            <span>{t("pages.checkout.address.receiver")}</span>
            <input
              required
              maxLength={100}
              value={receiverName}
              onChange={(event) => setReceiverName(event.target.value)}
              className="w-full rounded border border-gray-300 px-3 py-2 text-gray-800"
            />
          </label>
          <label className="space-y-1 text-sm text-gray-600">
            <span>{t("pages.checkout.address.phone")}</span>
            <input
              required
              type="tel"
              pattern="0[0-9]{9}"
              title={t("pages.checkout.address.phone-hint")}
              value={phone}
              onChange={(event) => setPhone(event.target.value)}
              className="w-full rounded border border-gray-300 px-3 py-2 text-gray-800"
            />
          </label>
          <label className="space-y-1 text-sm text-gray-600">
            <span>{t("pages.checkout.address.province")}</span>
            <select
              required
              value={provinceCode}
              onChange={(event) => handleProvinceChange(event.target.value)}
              disabled={isProvincesLoading || isProvincesError}
              className="w-full rounded border border-gray-300 bg-white px-3 py-2 text-gray-800"
            >
              <option value="">
                {isProvincesLoading
                  ? t("pages.checkout.address.province-loading")
                  : t("pages.checkout.address.province-placeholder")}
              </option>
              {provinces?.map((province) => (
                <option key={province.code} value={province.code}>
                  {province.name}
                </option>
              ))}
            </select>
            {isProvincesError && (
              <span role="alert" className="text-red-primary">
                {t("pages.checkout.address.province-error")}
              </span>
            )}
          </label>
          <label className="space-y-1 text-sm text-gray-600">
            <span>{t("pages.checkout.address.ward")}</span>
            <select
              required
              value={wardCode}
              onChange={(event) => setWardCode(event.target.value)}
              disabled={
                !provinceCode || isProvinceWardsLoading || isProvinceWardsError
              }
              className="w-full rounded border border-gray-300 bg-white px-3 py-2 text-gray-800"
            >
              <option value="">
                {isProvinceWardsLoading
                  ? t("pages.checkout.address.ward-loading")
                  : t("pages.checkout.address.ward-placeholder")}
              </option>
              {provinceWards?.map((ward) => (
                <option key={ward.code} value={ward.code}>
                  {ward.name}
                </option>
              ))}
            </select>
            {isProvinceWardsError && (
              <span role="alert" className="text-red-primary">
                {t("pages.checkout.address.ward-error")}
              </span>
            )}
          </label>
          <label className="space-y-1 text-sm text-gray-600 sm:col-span-2">
            <span>{t("pages.checkout.address.street")}</span>
            <input
              required
              maxLength={255}
              value={streetAddress}
              onChange={(event) => setStreetAddress(event.target.value)}
              placeholder={t("pages.checkout.address.street-placeholder")}
              className="w-full rounded border border-gray-300 px-3 py-2 text-gray-800"
            />
          </label>
        </div>
        {selectedProvince && provinceCode && (
          <p className="text-xs text-gray-500">
            {selectedProvince.name}
            {selectedWard ? ` · ${selectedWard.name}` : ""}
          </p>
        )}
      </section>

      <section className="space-y-4 bg-white p-5">
        <h2 className="font-medium text-gray-800">
          {t("pages.checkout.items.title")}
        </h2>
        <div className="divide-y divide-gray-100">
          {checkoutItems.map((item) => {
            const product = item.product_variant.product;
            const image =
              product.images?.find((entry) => entry.is_primary) ??
              product.images?.[0];
            const imageUrl = getAssetUrl(
              image?.thumbnail ?? image?.original ?? image?.url,
            );
            return (
              <div key={item.id} className="flex items-center gap-3 py-3">
                <div className="relative h-16 w-16 shrink-0 bg-gray-50">
                  {imageUrl && (
                    <Image
                      src={imageUrl}
                      alt={product.name}
                      fill
                      unoptimized
                      sizes="64px"
                      className="object-cover"
                    />
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="line-clamp-2 text-sm text-gray-800">
                    {product.name}
                  </p>
                  <p className="text-xs text-gray-500">
                    {t("pages.checkout.items.quantity", {
                      count: item.quantity,
                    })}
                  </p>
                </div>
                <p className="whitespace-nowrap text-sm text-red-primary">
                  ₫{formatCurrency(item.product_variant.price * item.quantity)}
                </p>
              </div>
            );
          })}
        </div>
      </section>

      <section className="space-y-4 bg-white p-5">
        <h2 className="font-medium text-gray-800">
          {t("pages.checkout.payment.title")}
        </h2>
        {isMethodsLoading && (
          <p className="text-sm text-gray-500">
            {t("pages.checkout.payment.loading")}
          </p>
        )}
        {isMethodsError && (
          <p role="alert" className="text-sm text-red-primary">
            {t("pages.checkout.payment.error")}
          </p>
        )}
        <div className="space-y-3">
          {paymentMethods?.map((method) => (
            <label
              key={method.id}
              className={`flex gap-3 rounded border p-3 ${
                method.enabled
                  ? "cursor-pointer border-gray-200"
                  : "cursor-not-allowed border-gray-100 opacity-50"
              }`}
            >
              <input
                type="radio"
                name="payment_method"
                value={method.id}
                checked={paymentMethod === method.id}
                disabled={!method.enabled}
                onChange={() => setPaymentMethod(method.id)}
                className="mt-1 accent-red-500"
              />
              <span>
                <span className="block text-sm font-medium text-gray-800">
                  {t(paymentMethodTranslationKeys[method.id].label)}
                  {!method.enabled &&
                    ` (${t("pages.checkout.payment.not-configured")})`}
                </span>
                <span className="mt-1 block text-xs text-gray-500">
                  {t(paymentMethodTranslationKeys[method.id].description)}
                </span>
              </span>
            </label>
          ))}
        </div>
      </section>

      <section className="space-y-3 bg-white p-5">
        <div className="flex justify-between text-sm text-gray-600">
          <span>{t("pages.checkout.summary.subtotal")}</span>
          <span>₫{formatCurrency(subtotal)}</span>
        </div>
        <div className="flex justify-between text-sm text-gray-600">
          <span>{t("pages.checkout.summary.shipping")}</span>
          <span>{t("pages.checkout.summary.shipping-at-order")}</span>
        </div>
        <p className="text-xs text-gray-500">
          {t("pages.checkout.summary.shipping-note")}
        </p>
        <div className="flex items-center justify-between border-t pt-4">
          <span className="text-sm text-gray-700">
            {t("pages.checkout.summary.total")}
          </span>
          <strong className="text-xl font-medium text-red-primary">
            ₫{formatCurrency(subtotal)}
          </strong>
        </div>
        <button
          type="submit"
          disabled={
            isSubmitting ||
            isMethodsLoading ||
            isMethodsError ||
            invalidSelection ||
            enabledMethods.length === 0
          }
          className="w-full rounded-sm bg-red-primary px-6 py-3 text-sm text-white disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto"
        >
          {isSubmitting
            ? t("pages.checkout.submit.loading")
            : t("pages.checkout.submit.button")}
        </button>
      </section>
    </form>
  );
};

export default CheckoutPage;
