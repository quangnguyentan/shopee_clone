import axios from "axios";
import { getEnv } from "./env.client";

const env = getEnv();

export const api = axios.create({
  baseURL: env.NEXT_PUBLIC_API_URL,
  withCredentials: true,
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
