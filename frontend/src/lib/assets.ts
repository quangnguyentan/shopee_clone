import { getEnv } from "../common/config/env.client";

export const getAssetUrl = (path?: string) => {
  const { NEXT_PUBLIC_API_URL } = getEnv();
  if (!path) return undefined;

  if (path.startsWith("http")) return path;

  return `${NEXT_PUBLIC_API_URL}${path}`;
};
