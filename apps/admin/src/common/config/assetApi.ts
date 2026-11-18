// src/config/assetApi.ts
import axios from "axios";
import { getEnv } from "./env.client";

const env = getEnv();

export const assetApiClient = axios.create({
  baseURL: env.VITE_ASSET_URL,
  withCredentials: false,
});
