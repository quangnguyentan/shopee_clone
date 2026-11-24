"use client";

import Image from "next/image";
import Link from "next/link";
import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import type { ProductDetail } from "@/src/common/types/product.type";
import type { ProductVariant } from "@/src/common/types/product-variant.type";
import {
  useGetProductsByShopQuery,
  useViewProductByIdQuery,
} from "@/src/common/api/product.api";
import { useAddCartItemMutation } from "@/src/common/api/cart.api";
import { useAppSelector } from "@/src/common/hooks/useAppSelector";
import ProductReviews from "./ProductReviews";
import { getAssetUrl } from "@/src/lib/assets";
import { formatCurrency } from "@/src/common/helper/formatCurrency";
import { formatSold } from "@/src/common/helper/formatSold";
import { createShopeeSlug } from "@/src/lib/utils";
import ProductCard from "@/src/features/home/components/ProductCard";

interface BuyerProductDetailProps {
  productId: string;
}

interface VariantOption {
  key: string;
  label: string;
}

interface VariantOptionGroup {
  id: string;
  name: string;
  options: VariantOption[];
}

const optionKey = (variant: ProductVariant, attributeId: string) => {
  const attribute = variant.attributes?.find(
    (item) => item.attribute_id === attributeId,
  );
  if (!attribute) return undefined;
  if (attribute.value_id) return attribute.value_id;
  return attribute.custom_value
    ? `custom:${attribute.custom_value}`
    : undefined;
};

const getApiError = (error: unknown) => {
  if (
    error &&
    typeof error === "object" &&
    "data" in error &&
    error.data &&
    typeof error.data === "object" &&
    "message" in error.data
  ) {
    const message = error.data.message;
    if (typeof message === "string") return message;
    if (Array.isArray(message)) return message.join(", ");
  }
  return "Không thể thêm sản phẩm vào giỏ hàng. Vui lòng thử lại.";
};

const StarRating = ({ rating }: { rating: number }) => (
  <span className="tracking-wide text-amber-500" aria-label={`${rating} sao`}>
    {"★".repeat(Math.max(0, Math.min(5, Math.round(rating))))}
    {"☆".repeat(5 - Math.max(0, Math.min(5, Math.round(rating))))}
  </span>
);

const BuyerProductDetail = ({ productId }: BuyerProductDetailProps) => {
  const router = useRouter();
  const isAuthenticated = useAppSelector((state) => state.auth.isAuthenticated);
  const {
    data: product,
    isLoading,
    isError,
  } = useViewProductByIdQuery(productId);
  const [addCartItem, { isLoading: isAddingToCart }] = useAddCartItemMutation();
  const [selectedImage, setSelectedImage] = useState(0);
  const [variantSelection, setVariantSelection] = useState<{
    productId: string;
    values: Record<string, string>;
  } | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [isFavorite, setIsFavorite] = useState(false);

  const variantGroups = useMemo<VariantOptionGroup[]>(() => {
    const groups = new Map<string, VariantOptionGroup>();
    for (const variant of product?.variants ?? []) {
      for (const variantAttribute of variant.attributes ?? []) {
        const attribute = variantAttribute.attribute;
        if (!attribute) continue;

        const group = groups.get(attribute.id) ?? {
          id: attribute.id,
          name: attribute.name,
          options: [],
        };
        const key = variantAttribute.value_id
          ? variantAttribute.value_id
          : variantAttribute.custom_value
            ? `custom:${variantAttribute.custom_value}`
            : undefined;
        const label =
          variantAttribute.value?.value ?? variantAttribute.custom_value;
        if (
          key &&
          label &&
          !group.options.some((option) => option.key === key)
        ) {
          group.options.push({ key, label });
        }
        groups.set(attribute.id, group);
      }
    }
    return [...groups.values()];
  }, [product?.variants]);

  const defaultSelectedValues = useMemo(() => {
    const firstVariant = product?.variants?.[0];
    const initialValues: Record<string, string> = {};
    if (!firstVariant) return initialValues;
    for (const group of variantGroups) {
      const key = optionKey(firstVariant, group.id);
      if (key) initialValues[group.id] = key;
    }
    return initialValues;
  }, [product?.variants, variantGroups]);
  const selectedValues =
    variantSelection && variantSelection.productId === product?.id
      ? variantSelection.values
      : defaultSelectedValues;

  const selectedVariant = useMemo(() => {
    const variants = product?.variants ?? [];
    if (variantGroups.length === 0) return variants[0];
    if (!variantGroups.every((group) => selectedValues[group.id])) return;

    return variants.find((variant) =>
      variantGroups.every(
        (group) => optionKey(variant, group.id) === selectedValues[group.id],
      ),
    );
  }, [product?.variants, selectedValues, variantGroups]);

  const { data: shopProducts = [] } = useGetProductsByShopQuery(
    product?.shop_id ?? "",
    { skip: !product?.shop_id },
  );
  const images = product?.images ?? [];
  const currentImage = images[selectedImage] ?? images[0];
  const currentImageUrl = getAssetUrl(
    currentImage?.original ?? currentImage?.url,
  );
  const price = selectedVariant?.price ?? product?.price_min ?? 0;
  const hasExplicitVariantSelection =
    !!product && variantSelection?.productId === product.id;
  const showPriceRange =
    !!product &&
    product.price_min !== product.price_max &&
    !hasExplicitVariantSelection;
  const availableStock = selectedVariant?.stock ?? product?.stock ?? 0;
  const recommendations = product?.similar_products ?? [];
  const otherShopProducts = shopProducts
    .filter((item) => item.id !== productId && item.status === "active")
    .slice(0, 6);

  const addToCart = async (buyNow = false) => {
    if (!isAuthenticated) {
      router.push(
        `/buyer/login?redirect=${encodeURIComponent(`/product/${productId}`)}`,
      );
      return;
    }
    if (!selectedVariant) {
      toast.error("Vui lòng chọn đầy đủ phân loại sản phẩm.");
      return;
    }
    if (quantity > availableStock) {
      toast.error(`Sản phẩm chỉ còn ${availableStock} trong kho.`);
      return;
    }

    try {
      const cartItem = await addCartItem({
        variant_id: Number(selectedVariant.id),
        quantity,
      }).unwrap();
      toast.success("Đã thêm sản phẩm vào giỏ hàng.");
      if (buyNow) {
        router.push(`/cart?selectedItem=${encodeURIComponent(cartItem.id)}`);
      }
    } catch (error) {
      toast.error(getApiError(error));
    }
  };

  if (isLoading) {
    return (
      <div className="mx-auto max-w-screen-xl px-4 py-8 sm:px-8">
        <div className="grid gap-8 bg-white p-6 md:grid-cols-2">
          <div className="aspect-square animate-pulse bg-gray-100" />
          <div className="space-y-4">
            <div className="h-8 animate-pulse bg-gray-100" />
            <div className="h-24 animate-pulse bg-gray-100" />
          </div>
        </div>
      </div>
    );
  }

  if (isError || !product) {
    return (
      <div className="mx-auto max-w-screen-xl px-4 py-16 text-center sm:px-8">
        <p role="alert" className="text-red-primary">
          Không thể tải sản phẩm này.
        </p>
        <Link href="/" className="mt-4 inline-block text-sm text-blue-primary">
          Quay lại trang chủ
        </Link>
      </div>
    );
  }

  return (
    <main className="mx-auto max-w-[1240px] space-y-5 px-4 py-5 sm:px-6">
      <nav
        aria-label="Breadcrumb"
        className="flex flex-wrap items-center gap-2 text-xs text-gray-500"
      >
        <Link href="/" className="hover:text-red-primary">
          Shopee
        </Link>
        {product.category?.parent && (
          <>
            <span aria-hidden="true">&gt;</span>
            <Link
              href={`/${createShopeeSlug(
                product.category.parent.name,
                "cat",
                product.category.parent.id,
              )}`}
              className="hover:text-red-primary"
            >
              {product.category.parent.name}
            </Link>
          </>
        )}
        {product.category && (
          <>
            <span aria-hidden="true">&gt;</span>
            <span>{product.category.name}</span>
          </>
        )}
        <span aria-hidden="true">&gt;</span>
        <span className="line-clamp-1 text-gray-700">{product.name}</span>
      </nav>

      <section className="grid gap-6 bg-white p-4 md:grid-cols-[minmax(280px,420px)_minmax(0,1fr)] md:gap-8 md:p-6">
        <div className="min-w-0">
          <div className="relative mx-auto aspect-square w-full max-w-[420px] overflow-hidden bg-white">
            {currentImageUrl ? (
              <Image
                src={currentImageUrl}
                alt={product.name}
                fill
                priority
                unoptimized
                className="object-contain"
                sizes="(max-width: 768px) 100vw, 420px"
              />
            ) : (
              <div className="flex h-full items-center justify-center text-sm text-gray-400">
                Chưa có hình ảnh sản phẩm
              </div>
            )}
          </div>
          {images.length > 1 && (
            <div className="mt-3 grid grid-cols-5 gap-2">
              {images.slice(0, 10).map((image, index) => {
                const thumbnail = getAssetUrl(
                  image.thumbnail ?? image.original,
                );
                return (
                  <button
                    key={image.id}
                    type="button"
                    onClick={() => setSelectedImage(index)}
                    aria-label={`Xem ảnh ${index + 1}`}
                    className={`relative aspect-square overflow-hidden border-2 ${selectedImage === index
                      ? "border-red-primary"
                      : "border-transparent"
                      }`}
                  >
                    {thumbnail && (
                      <Image
                        src={thumbnail}
                        alt=""
                        fill
                        unoptimized
                        className="object-cover"
                        sizes="80px"
                      />
                    )}
                  </button>
                );
              })}
            </div>
          )}
          <div className="mt-5 flex items-center justify-between border-t border-gray-100 pt-4 text-sm">
            <button
              type="button"
              onClick={async () => {
                try {
                  await navigator.clipboard.writeText(window.location.href);
                  toast.success("Đã sao chép liên kết sản phẩm.");
                } catch {
                  toast.error("Không thể sao chép liên kết sản phẩm.");
                }
              }}
              className="text-gray-600 hover:text-red-primary"
            >
              Chia sẻ
            </button>
            <button
              type="button"
              onClick={() => setIsFavorite((value) => !value)}
              className="text-gray-600 hover:text-red-primary"
            >
              <span className={isFavorite ? "text-red-primary" : ""}>
                {isFavorite ? "♥" : "♡"}
              </span>{" "}
              {isFavorite ? "Đã thích" : "Yêu thích"}
            </button>
          </div>
        </div>

        <div className="min-w-0">
          <div className="mb-3 flex items-start gap-2">
            <span className="mt-1 shrink-0 rounded-sm bg-red-primary px-2 py-1 text-[11px] font-medium text-white">
              Yêu thích
            </span>
            {product.shop?.is_mall && (
              <span className="mt-1 shrink-0 bg-red-primary px-2 py-1 text-xs font-medium text-white">
                Shopee Mall
              </span>
            )}
            <h1 className="text-lg font-normal leading-7 text-gray-900 sm:text-xl">
              {product.name}
            </h1>
          </div>
          <div className="mb-5 flex flex-wrap items-center gap-x-4 gap-y-2 border-b border-gray-100 pb-4 text-sm">
            <a href="#reviews" className="flex items-center gap-2">
              <span className="border-b border-red-primary pb-0.5 text-red-primary">
                {Number(product.rating_avg ?? 0).toFixed(1)}
              </span>
              <StarRating rating={Number(product.rating_avg ?? 0)} />
            </a>
            <a
              href="#reviews"
              className="border-b border-gray-300 pb-0.5 text-gray-700"
            >
              {product.rating_count ?? 0} Đánh Giá
            </a>
            <span className="text-gray-500">
              Đã bán {formatSold(product.sold_count)}
            </span>
            <span className="ml-auto text-xs text-gray-500">
              Tố cáo
            </span>
          </div>

          <div className="mb-5 flex flex-wrap items-baseline gap-3 bg-[#fafafa] px-4 py-4 sm:px-5">
            {selectedVariant?.compare_at_price &&
              selectedVariant.compare_at_price > price && (
                <span className="text-sm text-gray-400 line-through">
                  ₫{formatCurrency(selectedVariant.compare_at_price)}
                </span>
              )}
            <span className="text-2xl font-medium text-red-primary">
              ₫{formatCurrency(showPriceRange ? product.price_min : price)}
              {showPriceRange && ` - ₫${formatCurrency(product.price_max)}`}
            </span>
          </div>

          <div className="space-y-5">
            <div className="grid grid-cols-[88px_minmax(0,1fr)] gap-3 text-sm sm:grid-cols-[96px_minmax(0,1fr)]">
              <span className="pt-2 text-gray-500">Vận chuyển</span>
              <p className="flex items-start gap-2 pt-2 text-gray-700">
                <span aria-hidden="true" className="text-teal-600">
                  ▣
                </span>
                Phí vận chuyển và thời gian giao hàng được tính theo địa chỉ
                nhận hàng.
              </p>
            </div>
            <div className="grid grid-cols-[88px_minmax(0,1fr)] gap-3 text-sm sm:grid-cols-[96px_minmax(0,1fr)]">
              <span className="pt-2 text-gray-500">An tâm mua sắm</span>
              <p className="pt-2 text-gray-700">
                Thông tin thanh toán và trạng thái đơn hàng được cập nhật trong
                tài khoản của bạn.
              </p>
            </div>

            {variantGroups.map((group) => (
              <div
                key={group.id}
                className="grid grid-cols-[88px_minmax(0,1fr)] gap-3 sm:grid-cols-[96px_minmax(0,1fr)] items-start"
              >
                <span className="pt-2 text-sm text-gray-500">
                  {group.name}
                </span>

                <div className="grid grid-cols-[repeat(auto-fill,minmax(90px,1fr))] gap-2">
                  {group.options.map((option) => {
                    const selected = selectedValues[group.id] === option.key;
                    return (
                      <button
                        key={option.key}
                        type="button"
                        onClick={() =>
                          setVariantSelection({
                            productId: product.id,
                            values: {
                              ...selectedValues,
                              [group.id]: option.key,
                            },
                          })
                        }
                        className={`w-full min-h-[40px] border bg-white px-2 py-1 text-sm truncate transition-colors ${selected
                          ? "border-red-primary text-red-primary shadow-[inset_0_0_0_1px_#ee4d2d]"
                          : "border-gray-200 text-gray-700 hover:border-red-primary"
                          }`}
                      >
                        {option.label}
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
            <div className="grid grid-cols-[88px_minmax(0,1fr)] items-center gap-3 sm:grid-cols-[96px_minmax(0,1fr)]">
              <label
                htmlFor="product-quantity"
                className="text-sm text-gray-500"
              >
                Số lượng
              </label>
              <div className="flex flex-wrap items-center gap-3">
                <div className="flex h-9 items-center border border-gray-300">
                  <button
                    type="button"
                    aria-label="Giảm số lượng"
                    onClick={() =>
                      setQuantity((value) => Math.max(1, value - 1))
                    }
                    className="h-full w-9 text-gray-600"
                  >
                    −
                  </button>
                  <input
                    id="product-quantity"
                    type="number"
                    min={1}
                    max={availableStock || undefined}
                    value={quantity}
                    onChange={(event) => {
                      const next = Number(event.target.value);
                      if (Number.isInteger(next) && next > 0) setQuantity(next);
                    }}
                    className="h-full w-12 border-x border-gray-300 text-center text-sm outline-none"
                  />
                  <button
                    type="button"
                    aria-label="Tăng số lượng"
                    onClick={() =>
                      setQuantity((value) =>
                        Math.min(availableStock || value + 1, value + 1),
                      )
                    }
                    className="h-full w-9 text-gray-600"
                  >
                    +
                  </button>
                </div>
                <span className="text-xs text-gray-500">
                  {availableStock > 0
                    ? `Còn ${availableStock} sản phẩm`
                    : "Hết hàng"}
                </span>
              </div>
            </div>

            <div className="flex flex-wrap gap-3 pl-0 sm:pl-[108px]">
              <button
                type="button"
                disabled={isAddingToCart || availableStock <= 0}
                onClick={() => addToCart()}
                className="flex h-11 items-center gap-2 border border-red-primary bg-red-50 px-5 text-sm text-red-primary hover:bg-red-100 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {isAddingToCart ? "Đang thêm..." : "Thêm vào giỏ hàng"}
              </button>
              <button
                type="button"
                disabled={isAddingToCart || availableStock <= 0}
                onClick={() => addToCart(true)}
                className="h-11 bg-red-primary px-8 text-sm font-medium text-white hover:bg-red-600 disabled:cursor-not-allowed disabled:opacity-50"
              >
                Mua ngay
              </button>
            </div>
          </div>
        </div>
      </section>

      {product.shop && (
        <section className="flex flex-wrap items-center justify-between gap-5 bg-white p-5 sm:p-6">
          <div className="flex items-center gap-4">
            {product.shop.logo ? (
              <Image
                src={getAssetUrl(product.shop.logo) ?? product.shop.logo}
                alt=""
                width={64}
                height={64}
                unoptimized
                className="h-16 w-16 rounded-full border border-gray-100 object-cover"
              />
            ) : (
              <span className="flex h-16 w-16 items-center justify-center rounded-full bg-gray-100 text-xl text-gray-500">
                {product.shop.name.charAt(0)}
              </span>
            )}
            <div>
              <h2 className="font-medium text-gray-800">{product.shop.name}</h2>
              <p className="mt-1 text-xs text-gray-500">
                Đánh giá shop: {Number(product.shop.rating ?? 0).toFixed(1)} ★
                {" · "}
                {product.shop.follower_count ?? 0} người theo dõi
              </p>
            </div>
          </div>
          <a
            href="#shop-products"
            className="border border-gray-300 px-4 py-2 text-sm text-gray-700 hover:border-red-primary hover:text-red-primary"
          >
            Xem sản phẩm của Shop
          </a>
        </section>
      )}

      <section className="bg-white p-5 sm:p-8">
        <h2 className="mb-5 bg-[#fafafa] px-4 py-3 text-lg font-medium uppercase text-gray-800">
          Chi tiết sản phẩm
        </h2>
        <dl className="divide-y divide-gray-100 text-sm">
          {[
            ["Danh mục", product.category?.name],
            ["Tên sản phẩm", product.name],
            ["Kho", availableStock > 0 ? "Còn hàng" : "Hết hàng"],
            ["Tình trạng", product.status === "active" ? "Mới" : "Ngừng bán"],
            ["Thương hiệu", product.shop?.name],
          ]
            .filter(([, value]) => value)
            .map(([label, value]) => (
              <div
                key={label}
                className="grid grid-cols-[140px_minmax(0,1fr)] gap-4 py-3"
              >
                <dt className="text-gray-500">{label}</dt>
                <dd className="text-gray-800">{value}</dd>
              </div>
            ))}
        </dl>
        <h2 className="mb-4 mt-8 bg-[#fafafa] px-4 py-3 text-lg font-medium uppercase text-gray-800">
          Mô tả sản phẩm
        </h2>
        {product.description ? (
          <div
            className="product-description whitespace-pre-wrap text-sm leading-7 text-gray-700"
            dangerouslySetInnerHTML={{ __html: product.description }}
          />
        ) : (
          <p className="text-sm text-gray-500">Chưa có mô tả sản phẩm.</p>
        )}
      </section>

      <ProductReviews productId={product.id} />

      {otherShopProducts.length > 0 && (
        <ProductShelf
          id="shop-products"
          title="Các sản phẩm khác của Shop"
          products={otherShopProducts}
        />
      )}
      {recommendations.length > 0 && (
        <ProductShelf
          title="Có thể bạn cũng thích"
          products={recommendations}
        />
      )}
    </main>
  );
};

const ProductShelf = ({
  id,
  title,
  products,
}: {
  id?: string;
  title: string;
  products: ProductDetail[];
}) => (
  <section id={id} className="scroll-mt-24 bg-white p-5 sm:p-6">
    <div className="mb-4 flex items-center justify-between">
      <h2 className="text-base font-medium uppercase text-gray-700">{title}</h2>
      <Link href="/" className="text-sm text-red-primary">
        Xem thêm
      </Link>
    </div>
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
      {products.map((product) => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  </section>
);

export default BuyerProductDetail;
