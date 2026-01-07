// src/common/socket.ts
import { io } from "socket.io-client";
import { getEnv } from "./env.config";

const env = getEnv();
const BASE_URL = env.NEXT_PUBLIC_API_URL;
export const socket = io(BASE_URL, {
  withCredentials: true,
  autoConnect: false,
  transports: ["websocket"],
});
