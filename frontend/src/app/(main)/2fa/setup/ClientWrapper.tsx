"use client";

import dynamic from "next/dynamic";

const Setup2FAClient = dynamic(() => import("./Setup2FAClient"), {
  ssr: false,
});

export default function ClientWrapper() {
  return <Setup2FAClient />;
}
