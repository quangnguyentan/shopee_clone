"use client";

import Link from "next/link";
import { ShoppingBag, ArrowLeft } from "lucide-react";

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center h-screen px-6 text-center">
      <div className="flex items-center gap-3 mb-4">
        <ShoppingBag size={48} className="text-orange-500" />
      </div>

      <h1 className="text-5xl font-extrabold text-gray-800 mb-3">404</h1>

      <p className="text-gray-600 text-lg mb-6">
        Oops! Trang bạn tìm không tồn tại hoặc đã bị xoá.
      </p>

      <Link
        href="/"
        className="flex items-center gap-2 bg-orange-500 hover:bg-orange-600 text-white px-5 py-3 rounded-lg transition-all"
      >
        <ArrowLeft size={20} />
        Quay về trang chủ
      </Link>
    </div>
  );
}
