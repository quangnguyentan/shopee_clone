import axios from "axios";
import { getEnv } from "../config/env.config";

export function createApi() {
  const env = getEnv();
  return axios.create({
    baseURL: env.NEXT_PUBLIC_API_URL,
    withCredentials: true,
  });
}
