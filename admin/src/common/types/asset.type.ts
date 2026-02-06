export type AssetType =
  | "products"
  | "avatars"
  | "shops"
  | "categories"
  | "product-description"
  | "flash-sales";

export type DescriptionImageResult = {
  items: { url: string }[];
};
