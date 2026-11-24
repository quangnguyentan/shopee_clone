"use client";

import Image from "next/image";
import Link from "next/link";
import { LuShoppingCart } from "./Icon";
import { useGetMyCartQuery } from "@/src/common/api/cart.api";
import { formatCurrency } from "@/src/common/helper/formatCurrency";
import { useAppSelector } from "@/src/common/hooks/useAppSelector";
import { getAssetUrl } from "@/src/lib/assets";
import { useLanguage } from "@/src/lib/locale";
import CustomHoverCard from "./CustomHoverCard";

const HeaderCartMenu = () => {
  const { t } = useLanguage();
  const isAuthenticated = useAppSelector(
    (state) => state.auth.isAuthenticated,
  );
  const {
    data: cart,
    isFetching,
    isError,
  } = useGetMyCartQuery(undefined, {
    skip: !isAuthenticated,
    refetchOnFocus: true,
  });
  const items = cart?.items ?? [];
  const productCount = items.length;
  const visibleItems = items.slice(0, 4);

  const content = !isAuthenticated ? (
    <div className="flex flex-col items-center gap-3 px-5 py-8 text-center">
      <LuShoppingCart className="size-12 text-gray-300" />
      <p className="text-sm text-gray-600">
        {t("pages.home.header.cart.sign-in")}
      </p>
      <Link
        href="/buyer/login?redirect=%2Fcart"
        className="rounded-sm bg-red-primary px-5 py-2 text-sm text-white hover:bg-red-600"
      >
        {t("pages.auth.login.button-login")}
      </Link>
    </div>
  ) : isFetching && !cart ? (
    <p className="px-4 py-8 text-center text-sm text-gray-500">
      {t("pages.home.header.cart.loading")}
    </p>
  ) : isError ? (
    <p role="alert" className="px-4 py-8 text-center text-sm text-red-primary">
      {t("pages.home.header.cart.error")}
    </p>
  ) : items.length === 0 ? (
    <div className="flex flex-col items-center gap-3 px-5 py-8 text-center">
      <LuShoppingCart className="size-12 text-gray-300" />
      <p className="text-sm text-gray-500">
        {t("pages.home.header.cart.empty")}
      </p>
      <Link
        href="/"
        className="rounded-sm bg-red-primary px-5 py-2 text-sm text-white hover:bg-red-600"
      >
        {t("pages.home.header.cart.view")}
      </Link>
    </div>
  ) : (
    <>
      <div className="border-b border-gray-100 px-2.5 py-2 text-xs text-gray-400">
        {t("pages.home.header.cart.title")}
      </div>
      <div className="max-h-64 overflow-y-auto">
        {visibleItems.map((item) => {
          const product = item.product_variant.product;
          const image =
            product.images?.find((productImage) => productImage.is_primary) ??
            product.images?.[0];
          const imageUrl = getAssetUrl(
            image?.thumbnail ?? image?.original ?? image?.url,
          );

          return (
            <Link
              key={item.id}
              href={`/product/${product.id}`}
              className="flex min-h-12 items-center gap-2 border-b border-gray-50 px-2.5 py-1.5 transition-colors hover:bg-gray-50"
            >
              <span className="relative size-9 shrink-0 overflow-hidden border border-gray-100 bg-gray-50">
                {imageUrl ? (
                  <Image
                    src={imageUrl}
                    alt={t("pages.home.header.cart.image-alt", {
                      name: product.name,
                    })}
                    fill
                    unoptimized
                    sizes="36px"
                    className="object-cover"
                  />
                ) : (
                  <LuShoppingCart className="m-auto size-5 text-gray-300" />
                )}
              </span>
              <span className="flex min-w-0 flex-1 items-center justify-between gap-2">
                <span className="flex min-w-0 items-center gap-1">
                  <span className="truncate text-xs text-gray-700">
                    {product.name}
                  </span>
                  {item.quantity > 1 && (
                    <span className="shrink-0 text-[11px] text-gray-400">
                      ×{item.quantity}
                    </span>
                  )}
                </span>
                <span className="shrink-0 text-xs text-red-primary">
                  ₫{formatCurrency(item.product_variant.price)}
                </span>
              </span>
            </Link>
          );
        })}
      </div>
      <div className="flex items-center justify-between gap-3 border-t px-4 py-3">
        <p className="text-xs text-gray-500">
          {items.length > visibleItems.length
            ? t("pages.home.header.cart.more-items", {
                count: items.length - visibleItems.length,
              })
            : null}
        </p>
        <Link
          href="/cart"
          className="shrink-0 rounded-sm bg-red-primary px-4 py-2 text-xs text-white hover:bg-red-600"
        >
          {t("pages.home.header.cart.view")}
        </Link>
      </div>
    </>
  );

  return (
    <CustomHoverCard
      trigger={
        <Link
          href="/cart"
          aria-label={`${t("pages.home.header.cart.label")}: ${t(
            "pages.home.header.cart.item-count",
            { count: productCount },
          )}`}
          className="relative flex h-10 w-12 items-center justify-center text-white"
        >
          <LuShoppingCart className="size-7" />
          {productCount > 0 && (
            <span className="absolute right-0 top-0 flex min-h-4 min-w-4 items-center justify-center rounded-full bg-white px-1 text-[10px] font-medium leading-4 text-red-primary">
              {productCount > 99 ? "99+" : productCount}
            </span>
          )}
        </Link>
      }
      content={<div className="w-full">{content}</div>}
      openDelay={100}
      closeDelay={100}
      sideOffset={10}
      classNameContent="!w-[340px] !max-w-[calc(100vw-2rem)] !rounded-none !border-gray-200 !bg-white !p-0 !shadow-md after:pointer-events-none after:absolute after:-top-1.5 after:right-4 after:size-3 after:rotate-45 after:border-l after:border-t after:border-gray-200 after:bg-white after:content-['']"
    />
  );
};

export default HeaderCartMenu;
