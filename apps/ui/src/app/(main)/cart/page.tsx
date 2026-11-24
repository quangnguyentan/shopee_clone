"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  useGetMyCartQuery,
  useRemoveCartItemMutation,
  useUpdateCartItemMutation,
} from "@/src/common/api/cart.api";
import type { CartItemView } from "@/src/common/api/cart.api";
import { useAppSelector } from "@/src/common/hooks/useAppSelector";
import { getAssetUrl } from "@/src/lib/assets";
import { formatCurrency } from "@/src/common/helper/formatCurrency";

type PendingQuantityUpdate = {
  desiredQuantity: number;
  running: boolean;
};

const getApiError = (error: unknown) => {
  if (!error || typeof error !== "object" || !("data" in error)) {
    return "Vui lòng thử lại.";
  }
  const { data } = error as { data?: { message?: string | string[] } };
  const message = data?.message;
  return Array.isArray(message) ? message.join(", ") : message || "Vui lòng thử lại.";
};

const CartPage = () => {
  const router = useRouter();
  const isAuthenticated = useAppSelector((state) => state.auth.isAuthenticated);
  const {
    data: cart,
    isLoading,
    isError,
  } = useGetMyCartQuery(undefined, { skip: !isAuthenticated });
  const [removeCartItem, { isLoading: isRemoving }] =
    useRemoveCartItemMutation();
  const [updateCartItem, { isLoading: isUpdating }] =
    useUpdateCartItemMutation();
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [quantityOverrides, setQuantityOverrides] = useState<
    Record<string, number>
  >({});
  const [selectionInitialized, setSelectionInitialized] = useState(false);
  const [pendingDelete, setPendingDelete] = useState<CartItemView | null>(null);
  const pendingQuantityUpdates = useRef(
    new Map<string, PendingQuantityUpdate>(),
  );

  const items = cart?.items ?? [];
  const itemIds = useMemo(() => items.map((item) => String(item.id)), [items]);
  const groups = useMemo(() => {
    const shopGroups = new Map<
      string,
      { id: string; name: string; items: CartItemView[] }
    >();
    for (const item of items) {
      const product = item.product_variant.product;
      const id = String(product.shop?.id ?? product.shop_id);
      const group = shopGroups.get(id) ?? {
        id,
        name: product.shop?.name ?? "Cửa hàng",
        items: [],
      };
      group.items.push(item);
      shopGroups.set(id, group);
    }
    return [...shopGroups.values()];
  }, [items]);

  const selectedItems = items.filter((item) =>
    selectedIds.has(String(item.id)),
  );
  const selectedTotal = selectedItems.reduce(
    (total, item) => {
      const quantity =
        quantityOverrides[String(item.id)] ?? item.quantity;
      return total + item.product_variant.price * quantity;
    },
    0,
  );
  const allSelected = items.length > 0 && selectedItems.length === items.length;
  const isBusy = isRemoving || isUpdating;

  useEffect(() => {
    if (!isAuthenticated || isLoading || selectionInitialized) return;
    const requestedId = new URLSearchParams(window.location.search).get(
      "selectedItem",
    );
    const initialSelection = requestedId
      ? items.filter((item) => String(item.id) === requestedId)
      : items;
    setSelectedIds(new Set(initialSelection.map((item) => String(item.id))));
    setSelectionInitialized(true);
  }, [isAuthenticated, isLoading, items, selectionInitialized]);

  const toggleItem = (itemId: string, checked: boolean) => {
    setSelectedIds((previous) => {
      const next = new Set(previous);
      if (checked) next.add(itemId);
      else next.delete(itemId);
      return next;
    });
  };

  const toggleGroup = (group: (typeof groups)[number], checked: boolean) => {
    setSelectedIds((previous) => {
      const next = new Set(previous);
      for (const item of group.items) {
        if (checked) next.add(String(item.id));
        else next.delete(String(item.id));
      }
      return next;
    });
  };

  const toggleAll = (checked: boolean) => {
    setSelectedIds(checked ? new Set(itemIds) : new Set());
  };

  const removeItem = async (itemId: string | number) => {
    try {
      await removeCartItem(String(itemId)).unwrap();
      setSelectedIds((previous) => {
        const next = new Set(previous);
        next.delete(String(itemId));
        return next;
      });
      setPendingDelete(null);
      toast.success("Đã xóa sản phẩm khỏi giỏ hàng.");
    } catch (error) {
      toast.error(`Không thể xóa sản phẩm. ${getApiError(error)}`);
    }
  };

  const queueQuantityUpdate = (
    itemId: string | number,
    quantity: number,
  ) => {
    const key = String(itemId);
    const pending = pendingQuantityUpdates.current.get(key) ?? {
      desiredQuantity: quantity,
      running: false,
    };
    pending.desiredQuantity = quantity;
    pendingQuantityUpdates.current.set(key, pending);
    if (pending.running) return;

    pending.running = true;
    void (async () => {
      try {
        while (pendingQuantityUpdates.current.get(key) === pending) {
          const requestedQuantity = pending.desiredQuantity;
          await updateCartItem({
            id: itemId,
            quantity: requestedQuantity,
          }).unwrap();
          if (pending.desiredQuantity === requestedQuantity) {
            setQuantityOverrides((previous) => {
              if (previous[key] !== requestedQuantity) return previous;
              const next = { ...previous };
              delete next[key];
              return next;
            });
            break;
          }
        }
      } catch (error) {
        setQuantityOverrides((previous) => {
          if (!(key in previous)) return previous;
          const next = { ...previous };
          delete next[key];
          return next;
        });
        toast.error(`Không thể cập nhật số lượng. ${getApiError(error)}`);
      } finally {
        if (pendingQuantityUpdates.current.get(key) === pending) {
          pendingQuantityUpdates.current.delete(key);
        }
      }
    })();
  };

  const changeQuantity = (item: CartItemView, delta: number) => {
    const currentQuantity =
      quantityOverrides[String(item.id)] ?? item.quantity;
    const quantity = currentQuantity + delta;
    if (quantity <= 0) {
      setPendingDelete(item);
      return;
    }
    if (quantity > item.product_variant.stock) {
      toast.error(`Sản phẩm chỉ còn ${item.product_variant.stock} trong kho.`);
      return;
    }

    setQuantityOverrides((previous) => ({
      ...previous,
      [String(item.id)]: quantity,
    }));
    queueQuantityUpdate(item.id, quantity);
  };

  const removeSelected = async () => {
    const ids = selectedItems.map((item) => String(item.id));
    if (!ids.length) return;
    try {
      await Promise.all(ids.map((id) => removeCartItem(id).unwrap()));
      setSelectedIds(new Set());
      toast.success(`Đã xóa ${ids.length} sản phẩm khỏi giỏ hàng.`);
    } catch (error) {
      toast.error(`Một số sản phẩm chưa thể xóa. ${getApiError(error)}`);
    }
  };

  const buySelected = () => {
    if (!selectedItems.length) {
      toast.info("Vui lòng chọn ít nhất một sản phẩm để mua.");
      return;
    }
    const ids = selectedItems.map((item) => String(item.id));
    router.push(`/checkout?items=${encodeURIComponent(ids.join(","))}`);
  };

  if (!isAuthenticated) {
    return (
      <main className="mx-auto max-w-screen-xl px-4 py-16 text-center sm:px-8">
        <p className="text-gray-700">Đăng nhập để xem giỏ hàng của bạn.</p>
        <button
          type="button"
          onClick={() =>
            router.push(`/buyer/login?redirect=${encodeURIComponent("/cart")}`)
          }
          className="mt-4 rounded-sm bg-red-primary px-6 py-2 text-sm text-white"
        >
          Đăng nhập
        </button>
      </main>
    );
  }

  if (isLoading) {
    return (
      <main className="mx-auto max-w-screen-xl px-4 py-12 sm:px-8">
        <div className="h-48 animate-pulse bg-white" />
      </main>
    );
  }

  if (isError) {
    return (
      <main className="mx-auto max-w-screen-xl px-4 py-12 text-center sm:px-8">
        <p role="alert" className="text-red-primary">
          Không thể tải giỏ hàng. Vui lòng thử lại.
        </p>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-screen-xl space-y-3 px-4 pb-28 pt-6 sm:px-8">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-medium text-gray-800">Giỏ hàng</h1>
        <Link href="/" className="text-sm text-red-primary hover:underline">
          Tiếp tục mua sắm
        </Link>
      </div>

      {!items.length ? (
        <section className="bg-white px-4 py-16 text-center">
          <p className="text-gray-600">Giỏ hàng của bạn đang trống.</p>
          <Link
            href="/"
            className="mt-5 inline-block rounded-sm bg-red-primary px-6 py-2 text-sm text-white"
          >
            Khám phá sản phẩm
          </Link>
        </section>
      ) : (
        <>
          <section className="grid grid-cols-[minmax(0,1fr)_100px_150px_120px_88px] items-center gap-3 bg-white px-5 py-4 text-sm text-gray-500 max-sm:hidden">
            <label className="flex items-center gap-3 text-gray-700">
              <input
                type="checkbox"
                checked={allSelected}
                onChange={(event) => toggleAll(event.target.checked)}
                aria-label="Chọn tất cả sản phẩm"
                className="h-4 w-4 accent-red-primary"
              />
              Sản phẩm
            </label>
            <span>Đơn giá</span>
            <span className="text-center">Số lượng</span>
            <span className="text-center">Số tiền</span>
            <span className="text-center">Thao tác</span>
          </section>

          {groups.map((group) => {
            const groupSelected = group.items.every((item) =>
              selectedIds.has(String(item.id)),
            );
            return (
              <section key={group.id} className="bg-white">
                <header className="flex items-center gap-3 border-b px-5 py-4 text-sm text-gray-700">
                  <input
                    type="checkbox"
                    checked={groupSelected}
                    onChange={(event) =>
                      toggleGroup(group, event.target.checked)
                    }
                    aria-label={`Chọn sản phẩm của ${group.name}`}
                    className="h-4 w-4 accent-red-primary"
                  />
                  <span className="rounded-sm bg-red-primary px-1.5 py-0.5 text-[10px] text-white">
                    Yêu thích
                  </span>
                  <span className="font-medium">{group.name}</span>
                </header>
                <div className="divide-y divide-gray-100">
                  {group.items.map((item) => {
                    const product = item.product_variant.product;
                    const quantity =
                      quantityOverrides[String(item.id)] ?? item.quantity;
                    const image =
                      product.images?.find((entry) => entry.is_primary) ??
                      product.images?.[0];
                    const imageUrl = getAssetUrl(
                      image?.thumbnail ?? image?.original ?? image?.url,
                    );
                    const options = item.product_variant.attributes
                      ?.map(
                        (attribute) =>
                          attribute.value?.value ?? attribute.custom_value,
                      )
                      .filter(Boolean)
                      .join(" · ");
                    const isSelected = selectedIds.has(String(item.id));

                    return (
                      <article
                        key={item.id}
                        className="grid grid-cols-[minmax(0,1fr)_100px_150px_120px_88px] items-center gap-3 px-5 py-4 max-sm:grid-cols-[minmax(0,1fr)_auto] max-sm:gap-x-3"
                      >
                        <div className="flex min-w-0 items-center gap-3 max-sm:col-span-2">
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={(event) =>
                              toggleItem(
                                String(item.id),
                                event.target.checked,
                              )
                            }
                            aria-label={`Chọn ${product.name}`}
                            className="h-4 w-4 shrink-0 accent-red-primary"
                          />
                          <div className="relative h-20 w-20 shrink-0 bg-gray-50">
                            {imageUrl && (
                              <Image
                                src={imageUrl}
                                alt={product.name}
                                fill
                                unoptimized
                                className="object-cover"
                                sizes="80px"
                              />
                            )}
                          </div>
                          <div className="min-w-0">
                            <Link
                              href={`/product/${product.id}`}
                              className="line-clamp-2 text-sm text-gray-800 hover:text-red-primary"
                            >
                              {product.name}
                            </Link>
                            {options && (
                              <p className="mt-1 text-xs text-gray-500">
                                Phân loại: {options}
                              </p>
                            )}
                            <p className="mt-1 text-xs text-gray-400 sm:hidden">
                              ₫{formatCurrency(item.product_variant.price)} ·
                              Còn {item.product_variant.stock}
                            </p>
                          </div>
                        </div>
                        <p className="text-sm text-gray-700 max-sm:hidden">
                          ₫{formatCurrency(item.product_variant.price)}
                        </p>
                        <div className="flex items-center justify-center max-sm:col-start-2 max-sm:justify-start">
                          <button
                            type="button"
                            aria-label="Giảm số lượng"
                            disabled={isRemoving}
                            onClick={() => changeQuantity(item, -1)}
                            className="h-8 w-8 border border-gray-300 text-gray-600 disabled:opacity-50"
                          >
                            −
                          </button>
                          <span className="flex h-8 min-w-10 items-center justify-center border-y border-gray-300 px-2 text-sm">
                            {quantity}
                          </span>
                          <button
                            type="button"
                            aria-label="Tăng số lượng"
                            disabled={
                              isRemoving ||
                              quantity >= item.product_variant.stock
                            }
                            onClick={() => changeQuantity(item, 1)}
                            className="h-8 w-8 border border-gray-300 text-gray-600 disabled:opacity-50"
                          >
                            +
                          </button>
                        </div>
                        <p className="text-center text-sm text-red-primary max-sm:col-start-2 max-sm:text-left">
                          ₫
                          {formatCurrency(
                            item.product_variant.price * quantity,
                          )}
                        </p>
                        <button
                          type="button"
                          disabled={isBusy}
                          onClick={() => setPendingDelete(item)}
                          className="text-center text-sm text-gray-600 hover:text-red-primary disabled:opacity-50 max-sm:col-start-2 max-sm:text-left"
                        >
                          Xóa
                        </button>
                      </article>
                    );
                  })}
                </div>
                <div className="border-t px-5 py-3 text-xs text-gray-500">
                  Phí vận chuyển sẽ được tính tại bước thanh toán.
                </div>
              </section>
            );
          })}

          <section className="fixed inset-x-0 bottom-0 z-30 border-t border-gray-200 bg-white shadow-[0_-4px_16px_rgba(0,0,0,0.06)]">
            <div className="mx-auto flex max-w-screen-xl flex-wrap items-center justify-between gap-4 px-4 py-4 sm:px-8">
              <div className="flex items-center gap-4 text-sm">
                <label className="flex items-center gap-2 text-gray-700">
                  <input
                    type="checkbox"
                    checked={allSelected}
                    onChange={(event) => toggleAll(event.target.checked)}
                    aria-label="Chọn tất cả sản phẩm"
                    className="h-4 w-4 accent-red-primary"
                  />
                  Chọn tất cả ({items.length})
                </label>
                <button
                  type="button"
                  disabled={!selectedItems.length || isBusy}
                  onClick={removeSelected}
                  className="text-gray-600 hover:text-red-primary disabled:cursor-not-allowed disabled:opacity-40"
                >
                  Xóa
                </button>
              </div>
              <div className="flex flex-1 items-center justify-end gap-5">
                <div className="text-right">
                  <p className="text-sm text-gray-700">
                    Tổng cộng ({selectedItems.length} sản phẩm):{" "}
                    <strong className="text-xl font-medium text-red-primary">
                      ₫{formatCurrency(selectedTotal)}
                    </strong>
                  </p>
                  <p className="text-xs text-gray-500">
                    Chưa bao gồm phí vận chuyển
                  </p>
                </div>
                <button
                  type="button"
                  disabled={!selectedItems.length || isBusy}
                  onClick={buySelected}
                  className="rounded-sm bg-red-primary px-8 py-3 text-sm text-white disabled:cursor-not-allowed disabled:opacity-50"
                >
                  Mua hàng
                </button>
              </div>
            </div>
          </section>
        </>
      )}

      {pendingDelete && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4"
          role="presentation"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) setPendingDelete(null);
          }}
        >
          <section
            role="dialog"
            aria-modal="true"
            aria-labelledby="remove-cart-item-title"
            className="w-full max-w-md rounded-sm bg-white p-6 shadow-xl"
          >
            <h2
              id="remove-cart-item-title"
              className="text-lg font-medium text-gray-800"
            >
              Xóa sản phẩm?
            </h2>
            <p className="mt-3 text-sm text-gray-600">
              Bạn có muốn xóa “{pendingDelete.product_variant.product.name}”
              khỏi giỏ hàng không?
            </p>
            <div className="mt-6 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setPendingDelete(null)}
                className="rounded-sm border border-gray-300 px-5 py-2 text-sm text-gray-700"
              >
                Trở lại
              </button>
              <button
                type="button"
                disabled={isRemoving}
                onClick={() => removeItem(pendingDelete.id)}
                className="rounded-sm bg-red-primary px-5 py-2 text-sm text-white disabled:opacity-50"
              >
                {isRemoving ? "Đang xóa..." : "Đồng ý"}
              </button>
            </div>
          </section>
        </div>
      )}
    </main>
  );
};

export default CartPage;
