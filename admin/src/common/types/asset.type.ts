export type AssetType =
  | "products"
  | "avatars"
  | "shops"
  | "categories"
  | "product-description";

export type DescriptionImageResult = {
  items: { url: string }[];
};
