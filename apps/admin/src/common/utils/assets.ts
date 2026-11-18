export const getAssetUrl = (path?: A) => {
  if (!path) return undefined;

  if (path.startsWith("http")) return path;

  return `${import.meta.env.VITE_ASSET_URL}${path}`;
};
