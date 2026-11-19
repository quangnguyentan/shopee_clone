export const getAssetUrl = (path?: A) => {
  if (!path) return undefined;

  const assetBase = new URL(import.meta.env.VITE_ASSET_URL);
  if (path.startsWith("http")) {
    const url = new URL(path);
    const isLocalHost = (hostname: string) =>
      hostname === "localhost" || hostname === "127.0.0.1";

    if (isLocalHost(url.hostname) && isLocalHost(assetBase.hostname)) {
      url.protocol = assetBase.protocol;
      url.host = assetBase.host;
      return url.toString();
    }

    return path;
  }

  return `${assetBase.origin}${path}`;
};
