"use client";

import Image from "next/image";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { MapPin, MessageCircle, Package, Send, Star, Users, X } from "lucide-react";
import { toast } from "sonner";
import { useGetShopByIdQuery } from "@/src/common/api/shop.api";
import {
  useFollowShopMutation,
  useGetShopFollowerCountQuery,
  useGetShopFollowStatusQuery,
  useUnfollowShopMutation,
} from "@/src/common/api/shop-follow.api";
import {
  useGetShopChatMessagesQuery,
  useSendShopChatMessageMutation,
} from "@/src/common/api/chat-message.api";
import { useGetMeQuery } from "@/src/common/api/user.api";
import { useGetProductsByShopQuery } from "@/src/common/api/product.api";
import { useAppSelector } from "@/src/common/hooks/useAppSelector";
import { getAssetUrl } from "@/src/lib/assets";
import ProductCard from "@/src/features/home/components/ProductCard";

const ShopPage = () => {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const isAuthenticated = useAppSelector(
    (state) => state.auth.isAuthenticated,
  );
  const { data: shop, isLoading: isShopLoading, isError } = useGetShopByIdQuery(id);
  const { data: products = [], isLoading: areProductsLoading } =
    useGetProductsByShopQuery(id);
  const { data: followerData } = useGetShopFollowerCountQuery(id);
  const { data: followStatus } = useGetShopFollowStatusQuery(id, {
    skip: !isAuthenticated,
  });
  const { data: profile } = useGetMeQuery(undefined, {
    skip: !isAuthenticated,
  });
  const [followShop, { isLoading: isFollowing }] = useFollowShopMutation();
  const [unfollowShop, { isLoading: isUnfollowing }] =
    useUnfollowShopMutation();
  const [chatOpen, setChatOpen] = useState(false);
  const [message, setMessage] = useState("");
  const chatEndRef = useRef<HTMLDivElement>(null);
  const canInteract = isAuthenticated && profile?.role === "buyer";
  const {
    data: messages = [],
    isLoading: areMessagesLoading,
    isError: isChatError,
  } = useGetShopChatMessagesQuery(id, {
    skip: !canInteract || !chatOpen,
    pollingInterval: chatOpen ? 5000 : 0,
  });
  const [sendMessage, { isLoading: isSending }] =
    useSendShopChatMessageMutation();

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const followerCount =
    followStatus?.follower_count ??
    followerData?.follower_count ??
    shop?.follower_count ??
    0;
  const logoUrl = getAssetUrl(shop?.logo);

  const handleFollow = async () => {
    if (!isAuthenticated) {
      router.push(
        `/buyer/login?redirect=${encodeURIComponent(`/shop/${id}`)}`,
      );
      return;
    }
    if (!canInteract) {
      toast.error("Chỉ tài khoản người mua mới có thể theo dõi cửa hàng.");
      return;
    }
    try {
      if (followStatus?.is_following) {
        await unfollowShop(id).unwrap();
        toast.success("Đã bỏ theo dõi cửa hàng.");
      } else {
        await followShop(id).unwrap();
        toast.success("Đã theo dõi cửa hàng.");
      }
    } catch {
      toast.error("Không thể cập nhật theo dõi. Vui lòng thử lại.");
    }
  };

  const openChat = () => {
    if (!isAuthenticated) {
      router.push(
        `/buyer/login?redirect=${encodeURIComponent(`/shop/${id}`)}`,
      );
      return;
    }
    if (!canInteract) {
      toast.error("Chỉ tài khoản người mua mới có thể nhắn tin cho cửa hàng.");
      return;
    }
    setChatOpen(true);
  };

  const submitMessage = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const trimmedMessage = message.trim();
    if (!trimmedMessage) return;
    try {
      await sendMessage({ shopId: id, message: trimmedMessage }).unwrap();
      setMessage("");
    } catch {
      toast.error("Không thể gửi tin nhắn. Vui lòng thử lại.");
    }
  };

  if (isShopLoading) {
    return (
      <main className="mx-auto max-w-screen-xl px-4 py-8 sm:px-8">
        <div className="h-52 animate-pulse bg-white" />
      </main>
    );
  }

  if (isError || !shop) {
    return (
      <main className="mx-auto max-w-screen-xl px-4 py-16 text-center sm:px-8">
        <p role="alert" className="text-gray-600">
          Không tìm thấy cửa hàng này.
        </p>
        <Link href="/" className="mt-4 inline-block text-red-primary">
          Về trang chủ
        </Link>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-screen-xl space-y-5 px-4 py-6 sm:px-8">
      <section className="rounded-sm bg-white p-5 sm:p-8">
        <div className="flex flex-col gap-6 sm:flex-row sm:items-center">
          <div className="flex min-w-0 flex-1 items-center gap-4">
            <div className="relative size-24 shrink-0 overflow-hidden rounded-full border border-gray-100 bg-gray-50 sm:size-28">
              {logoUrl ? (
                <Image
                  src={logoUrl}
                  alt={shop.name}
                  fill
                  unoptimized
                  className="object-cover"
                  sizes="112px"
                />
              ) : (
                <div className="flex h-full items-center justify-center text-3xl font-semibold text-red-primary">
                  {shop.name.slice(0, 1).toUpperCase()}
                </div>
              )}
            </div>
            <div className="min-w-0">
              <h1 className="truncate text-xl font-medium text-gray-800 sm:text-2xl">
                {shop.name}
              </h1>
              <p className="mt-1 text-sm text-gray-500">Cửa hàng Shopee</p>
              {shop.province_name && (
                <p className="mt-2 flex items-center gap-1 text-sm text-gray-500">
                  <MapPin aria-hidden="true" className="size-4" />
                  {shop.province_name}
                </p>
              )}
            </div>
          </div>

          <div className="flex flex-wrap gap-3 sm:justify-end">
            <button
              type="button"
              onClick={openChat}
              className="inline-flex items-center gap-2 rounded-sm border border-red-primary px-5 py-2.5 text-sm text-red-primary hover:bg-red-50"
            >
              <MessageCircle aria-hidden="true" className="size-4" />
              Chat ngay
            </button>
            <button
              type="button"
              onClick={handleFollow}
              disabled={isFollowing || isUnfollowing}
              className="inline-flex items-center gap-2 rounded-sm bg-red-primary px-5 py-2.5 text-sm text-white hover:bg-red-600 disabled:opacity-60"
            >
              <Users aria-hidden="true" className="size-4" />
              {followStatus?.is_following ? "Đang theo dõi" : "Theo dõi"}
            </button>
          </div>
        </div>

        <div className="mt-7 grid grid-cols-2 gap-4 border-t border-gray-100 pt-5 sm:grid-cols-4">
          <div className="flex items-center gap-2 text-sm">
            <Package aria-hidden="true" className="size-4 text-red-primary" />
            <span className="text-gray-500">Sản phẩm</span>
            <strong className="text-gray-800">{products.length}</strong>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <Users aria-hidden="true" className="size-4 text-red-primary" />
            <span className="text-gray-500">Người theo dõi</span>
            <strong className="text-gray-800">{followerCount}</strong>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <Star aria-hidden="true" className="size-4 text-amber-500" />
            <span className="text-gray-500">Đánh giá</span>
            <strong className="text-gray-800">
              {Number(shop.rating ?? 0).toFixed(1)}
            </strong>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <span className="text-gray-500">Đánh giá shop</span>
            <strong className="text-gray-800">{shop.rating_count ?? 0}</strong>
          </div>
        </div>
      </section>

      <section className="space-y-4">
        <h2 className="bg-white px-5 py-4 text-lg font-medium uppercase text-gray-800">
          Tất cả sản phẩm
        </h2>
        {areProductsLoading ? (
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
            {Array.from({ length: 10 }).map((_, index) => (
              <div key={index} className="aspect-[3/4] animate-pulse bg-white" />
            ))}
          </div>
        ) : products.length ? (
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
            {products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        ) : (
          <div className="bg-white px-5 py-14 text-center text-sm text-gray-500">
            Cửa hàng chưa có sản phẩm đang bán.
          </div>
        )}
      </section>

      {chatOpen && (
        <section
          role="dialog"
          aria-modal="true"
          aria-labelledby="shop-chat-title"
          className="fixed bottom-4 right-4 z-40 flex h-[min(520px,calc(100vh-2rem))] w-[min(360px,calc(100vw-2rem))] flex-col overflow-hidden rounded-sm bg-white shadow-2xl"
        >
          <header className="flex items-center justify-between bg-red-primary px-4 py-3 text-white">
            <div className="min-w-0">
              <h2 id="shop-chat-title" className="truncate font-medium">
                Chat với {shop.name}
              </h2>
              <p className="text-xs text-white/80">Tin nhắn trực tiếp đến shop</p>
            </div>
            <button
              type="button"
              onClick={() => setChatOpen(false)}
              aria-label="Đóng cửa sổ chat"
              className="rounded p-1 hover:bg-white/15"
            >
              <X aria-hidden="true" className="size-5" />
            </button>
          </header>
          <div className="flex-1 space-y-3 overflow-y-auto bg-gray-50 p-4">
            {areMessagesLoading && (
              <p className="text-center text-xs text-gray-500">
                Đang tải tin nhắn...
              </p>
            )}
            {isChatError && (
              <p role="alert" className="text-center text-xs text-red-primary">
                Không thể tải cuộc trò chuyện.
              </p>
            )}
            {!areMessagesLoading && !messages.length && !isChatError && (
              <p className="pt-8 text-center text-sm text-gray-500">
                Hãy gửi tin nhắn đầu tiên cho cửa hàng.
              </p>
            )}
            {messages.map((entry) => {
              const isOwnMessage = entry.sender.id === String(profile?.id);
              return (
                <div
                  key={entry.id}
                  className={`flex ${isOwnMessage ? "justify-end" : "justify-start"}`}
                >
                  <p
                    className={`max-w-[85%] whitespace-pre-wrap break-words rounded-lg px-3 py-2 text-sm ${
                      isOwnMessage
                        ? "bg-red-primary text-white"
                        : "bg-white text-gray-800 shadow-sm"
                    }`}
                  >
                    {entry.message}
                  </p>
                </div>
              );
            })}
            <div ref={chatEndRef} />
          </div>
          <form onSubmit={submitMessage} className="flex gap-2 border-t p-3">
            <input
              value={message}
              onChange={(event) => setMessage(event.target.value)}
              maxLength={2000}
              aria-label="Tin nhắn"
              placeholder="Nhập tin nhắn..."
              className="min-w-0 flex-1 rounded-sm border border-gray-300 px-3 py-2 text-sm outline-none focus:border-red-primary"
            />
            <button
              type="submit"
              aria-label="Gửi tin nhắn"
              disabled={!message.trim() || isSending}
              className="rounded-sm bg-red-primary px-3 text-white disabled:opacity-50"
            >
              <Send aria-hidden="true" className="size-4" />
            </button>
          </form>
        </section>
      )}
    </main>
  );
};

export default ShopPage;
