// src/common/socket.ts
import { io } from "socket.io-client";

export const socket = io(
  process.env.NEXT_PUBLIC_SOCKET_URL ?? "http://localhost:8080",
  {
    withCredentials: true,
    autoConnect: false,
    transports: ["websocket"],
  }
);
