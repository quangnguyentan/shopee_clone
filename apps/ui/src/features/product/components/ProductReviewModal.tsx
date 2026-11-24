"use client";

import axios from "axios";
import Image from "next/image";
import { useRef, useState, type ChangeEvent, type FormEvent } from "react";
import { toast } from "sonner";
import { useCreateProductReviewMutation } from "@/src/common/api/product-review.api";
import { getAssetUrl } from "@/src/lib/assets";
import { getEnv } from "@/src/common/config/env.client";
import { useLanguage, type I18nKeys } from "@/src/lib/locale";

const MAX_PHOTOS = 5;
const MAX_PHOTO_SIZE = 5 * 1024 * 1024;
const ACCEPTED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp"];
const RATING_LABEL_KEYS: Record<number, I18nKeys> = {
  1: "pages.purchase.review.rating.1",
  2: "pages.purchase.review.rating.2",
  3: "pages.purchase.review.rating.3",
  4: "pages.purchase.review.rating.4",
  5: "pages.purchase.review.rating.5",
};

export interface ProductReviewTarget {
  orderItemId: string;
  productId: string;
  productName: string;
  imageUrl?: string | null;
  variantLabel?: string | null;
}

interface ProductReviewModalProps {
  target: ProductReviewTarget;
  onClose: () => void;
}

const ProductReviewModal = ({
  target,
  onClose,
}: ProductReviewModalProps) => {
  const { t } = useLanguage();
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [mediaUrls, setMediaUrls] = useState<string[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [createReview, { isLoading: isSubmitting }] =
    useCreateProductReviewMutation();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const productImageUrl = getAssetUrl(target.imageUrl);

  const uploadPhotos = async (event: ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.currentTarget.files ?? []);
    event.currentTarget.value = "";
    if (!files.length) return;

    const validFiles = files.filter(
      (file) =>
        ACCEPTED_IMAGE_TYPES.includes(file.type) &&
        file.size <= MAX_PHOTO_SIZE,
    );
    if (validFiles.length !== files.length) {
      toast.error(t("pages.purchase.review.photo-invalid"));
    }

    const remainingSlots = MAX_PHOTOS - mediaUrls.length;
    if (validFiles.length > remainingSlots) {
      toast.error(t("pages.purchase.review.photo-limit"));
    }
    const filesToUpload = validFiles.slice(0, remainingSlots);
    if (!filesToUpload.length) return;

    const formData = new FormData();
    filesToUpload.forEach((file) => formData.append("files", file));
    setIsUploading(true);
    try {
      const assetBaseUrl = getEnv().NEXT_PUBLIC_ASSETS_URL.replace(/\/+$/, "");
      const { data } = await axios.post<{ items: { url: string }[] }>(
        `${assetBaseUrl}/assets/upload?type=product-description`,
        formData,
      );
      const uploadedUrls = data.items.map((item) => item.url).filter(Boolean);
      if (uploadedUrls.length !== filesToUpload.length) {
        throw new Error("Image service returned an incomplete upload result.");
      }
      setMediaUrls((current) =>
        [...current, ...uploadedUrls].slice(0, MAX_PHOTOS),
      );
    } catch {
      toast.error(t("pages.purchase.review.photo-upload-error"));
    } finally {
      setIsUploading(false);
    }
  };

  const submitReview = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    try {
      await createReview({
        order_item_id: target.orderItemId,
        product_id: target.productId,
        rating,
        comment: comment.trim() || undefined,
        media_urls: mediaUrls,
      }).unwrap();
      toast.success(t("pages.purchase.review.success"));
      onClose();
    } catch (error) {
      const data =
        error && typeof error === "object" && "data" in error
          ? error.data
          : undefined;
      const message =
        data && typeof data === "object" && "message" in data
          ? data.message
          : undefined;
      toast.error(
        Array.isArray(message)
          ? message.join(", ")
          : typeof message === "string"
            ? message
            : t("pages.purchase.review.error"),
      );
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-3 sm:p-6"
      role="presentation"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby="product-review-title"
        className="max-h-[92vh] w-full max-w-2xl overflow-y-auto rounded-sm bg-white p-5 shadow-xl sm:p-7"
      >
        <h2
          id="product-review-title"
          className="mb-5 text-xl font-medium text-gray-800"
        >
          {t("pages.purchase.review.title")}
        </h2>

        <div className="flex items-center gap-3 border-b border-gray-100 pb-4">
          <div className="relative size-14 shrink-0 overflow-hidden border border-gray-100 bg-gray-50">
            {productImageUrl && (
              <Image
                src={productImageUrl}
                alt={target.productName}
                fill
                unoptimized
                sizes="56px"
                className="object-cover"
              />
            )}
          </div>
          <div className="min-w-0">
            <p className="line-clamp-2 text-sm text-gray-800">
              {target.productName}
            </p>
            {target.variantLabel && (
              <p className="mt-1 text-xs text-gray-500">
                {target.variantLabel}
              </p>
            )}
          </div>
        </div>

        <form onSubmit={submitReview}>
          <div className="py-5">
            <div className="flex flex-wrap items-center gap-4">
              <span className="text-sm text-gray-700">
                {t("pages.purchase.review.quality")}
              </span>
              <div
                role="radiogroup"
                aria-label={t("pages.purchase.review.quality")}
                className="flex items-center gap-1"
              >
                {[1, 2, 3, 4, 5].map((value) => (
                  <button
                    key={value}
                    type="button"
                    role="radio"
                    aria-checked={rating === value}
                    aria-label={t(RATING_LABEL_KEYS[value])}
                    onClick={() => setRating(value)}
                    className={`text-3xl leading-none transition ${
                      value <= rating
                        ? "text-amber-400"
                        : "text-gray-300 hover:text-amber-300"
                    }`}
                  >
                    ★
                  </button>
                ))}
              </div>
              <span className="text-sm font-medium text-amber-500">
                {t(RATING_LABEL_KEYS[rating])}
              </span>
            </div>
          </div>

          <label
            htmlFor="product-review-comment"
            className="mb-2 block text-sm font-medium text-gray-700"
          >
            {t("pages.purchase.review.comment-label")}
          </label>
          <textarea
            id="product-review-comment"
            value={comment}
            onChange={(event) => setComment(event.target.value)}
            maxLength={5000}
            rows={6}
            placeholder={t("pages.purchase.review.comment-placeholder")}
            className="w-full resize-y rounded-sm border border-gray-300 p-3 text-sm text-gray-800 outline-none focus:border-red-primary"
          />
          <p className="mt-1 text-right text-xs text-gray-400">
            {comment.length}/5000
          </p>

          <div className="mt-4">
            <input
              ref={fileInputRef}
              type="file"
              accept={ACCEPTED_IMAGE_TYPES.join(",")}
              multiple
              onChange={(event) => void uploadPhotos(event)}
              className="hidden"
              aria-label={t("pages.purchase.review.photo-add")}
            />
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={isUploading || mediaUrls.length >= MAX_PHOTOS}
              className="rounded-sm border border-red-primary px-4 py-2 text-sm text-red-primary hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isUploading
                ? t("pages.purchase.review.submitting")
                : t("pages.purchase.review.photo-add")}
            </button>
            <p className="mt-2 text-xs text-gray-500">
              {t("pages.purchase.review.photo-limit")}
            </p>
            {mediaUrls.length > 0 && (
              <div className="mt-3 flex flex-wrap gap-2">
                {mediaUrls.map((url, index) => {
                  const imageUrl = getAssetUrl(url);
                  return (
                    <div
                      key={url}
                      className="relative size-16 overflow-hidden border border-gray-200"
                    >
                      {imageUrl && (
                        <Image
                          src={imageUrl}
                          alt=""
                          fill
                          unoptimized
                          sizes="64px"
                          className="object-cover"
                        />
                      )}
                      <button
                        type="button"
                        aria-label={t(
                          "pages.purchase.review.remove-photo",
                          { number: index + 1 },
                        )}
                        onClick={() =>
                          setMediaUrls((current) =>
                            current.filter((entry) => entry !== url),
                          )
                        }
                        className="absolute right-0 top-0 bg-black/70 px-1 text-xs text-white"
                      >
                        ×
                      </button>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          <div className="mt-7 flex justify-end gap-3 border-t border-gray-100 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="rounded-sm border border-gray-300 px-5 py-2 text-sm text-gray-600"
            >
              {t("pages.purchase.review.close")}
            </button>
            <button
              type="submit"
              disabled={isSubmitting || isUploading || rating < 1}
              className="rounded-sm bg-red-primary px-6 py-2 text-sm text-white hover:bg-red-600 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isSubmitting
                ? t("pages.purchase.review.submitting")
                : t("pages.purchase.review.submit")}
            </button>
          </div>
        </form>
      </section>
    </div>
  );
};

export default ProductReviewModal;
