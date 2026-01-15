import { api } from "./api";

let refreshPromise: Promise<A> | null = null;

export const refreshApi = {
  refresh() {
    if (!refreshPromise) {
      refreshPromise = api.post("/auth/refresh").finally(() => {
        refreshPromise = null;
      });
    }

    return refreshPromise;
  },
};
