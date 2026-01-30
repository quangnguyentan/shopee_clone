import type { UploadFileWithExtra } from "@/components/Uploader";
import type {
  Attribute,
  NormalizedImage,
  Variant,
  VariantAttribute,
} from "../types";
import type { Product } from "@/common/types/product.type";
import type { UploadFileStatus } from "antd/es/upload/interface";
import { getAssetUrl } from "@/common/utils/assets";

export const buildKey = (attrs?: VariantAttribute[]) => {
  if (!Array.isArray(attrs) || attrs.length === 0) return "";

  return [...attrs]
    .sort((a, b) => a.attribute_name.localeCompare(b.attribute_name))
    .map((a) => `${a.attribute_name}:${a.value}`)
    .join("|");
};

export const cartesian = (attrs: Attribute[]): VariantAttribute[][] => {
  if (!Array.isArray(attrs) || attrs.length === 0) return [];

  return attrs.reduce<VariantAttribute[][]>(
    (acc, attr) =>
      acc.flatMap((a) =>
        (attr.values ?? []).map((v) => [
          ...a,
          { attribute_name: attr.name!, value: v },
        ]),
      ),
    [[]],
  );
};

export const buildStructureKey = (attrs: Attribute[]) =>
  cartesian(attrs.filter((a) => a.name && a.values?.length))
    .map(buildKey)
    .join(",");

const extractAssetPath = (url?: string) => {
  if (!url) return undefined;
  const assetBase = import.meta.env.VITE_ASSET_URL;
  return url.startsWith(assetBase) ? url.replace(assetBase, "") : url;
};
export const normalizeImages = (
  images: UploadFileWithExtra[],
): NormalizedImage[] => {
  return images.map((img) => ({
    isPrimary: !!img.isPrimary,
    url: img.url ? extractAssetPath(img.url) : undefined,
    file: img.originFileObj as File | undefined,
  }));
};

export const mapImagesToUpload = (images?: Product["images"]) =>
  images?.map((img) => ({
    uid: String(img.id),
    name: img.url.split("/").pop(),
    status: "done" as UploadFileStatus,
    url: getAssetUrl(img?.url),
    isPrimary: img.is_primary,
  })) ?? [];

export const normalizeProductVariants = (
  variants?: Product["variants"],
): Variant[] => {
  if (!variants) return [];

  return variants.map((v) => ({
    price: v.price,
    stock: v.stock,
    sku: v.sku,
    attributes: v.attributes.map((a) => ({
      attribute_name: a.name,
      value: a.value,
    })),
  }));
};
