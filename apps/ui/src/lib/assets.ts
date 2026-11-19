import { getEnv } from "../common/config/env.client";

export const getAssetUrl = (path?: string) => {
  if (!path) return undefined;

  const assetBase = new URL(getEnv().NEXT_PUBLIC_ASSETS_URL);
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
