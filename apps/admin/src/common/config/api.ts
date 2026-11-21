import axios from "axios";
import { getEnv } from "./env.client";
import { getAuthScope } from "../constants";

const env = getEnv();

export const api = axios.create({
  baseURL: env.VITE_PUBLIC_API_URL,
  withCredentials: true,
});

api.interceptors.request.use((config) => {
  config.headers["x-auth-scope"] = getAuthScope();
  return config;
});

declare module "axios" {
  export interface AxiosRequestConfig {
    _retry?: boolean;
  }
}

export let pageUnloading = false;

if (typeof window !== "undefined") {
  window.addEventListener("beforeunload", () => {
    pageUnloading = true;
  });
}
