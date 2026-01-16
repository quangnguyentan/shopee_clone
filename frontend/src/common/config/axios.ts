/* eslint-disable @typescript-eslint/no-unused-expressions */
import { refreshApi } from "./refreshApi";
import { api, pageUnloading } from "./api";
import { AUTH_SCOPE } from "../constants";

let appStore: A;
let isRefreshing = false;
let queue: ((err?: A) => void)[] = [];

export const injectStore = (store: A) => {
  appStore = store;
};

const flushQueue = (err?: A) => {
  queue.forEach((cb) => cb(err));
  queue = [];
};

api.interceptors.response.use(
  (res) => res,
  async (error) => {
    const original = error.config;
    if (!original || !appStore) return Promise.reject(error);
    if (pageUnloading) return Promise.reject(error);

    if (original.url?.includes(`/auth/${AUTH_SCOPE}/refresh`)) {
      return Promise.reject(error);
    }

    const state = appStore.getState();

    if (state.auth.bootstrapping) {
      return Promise.reject(error);
    }

    if (error.response?.status !== 401 || original._retry) {
      return Promise.reject(error);
    }

    original._retry = true;

    if (isRefreshing) {
      return new Promise((resolve, reject) => {
        queue.push((err) => {
          if (err) reject(err);
          else resolve(api(original));
        });
      });
    }

    isRefreshing = true;

    try {
      await refreshApi.refresh();
      flushQueue();
      return api(original);
    } catch (err) {
      flushQueue(err);

      return Promise.reject(err);
    } finally {
      isRefreshing = false;
    }
  }
);
