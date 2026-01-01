"use client";

export const dynamic = "force-dynamic";

import Setup2FAForm from "@/src/features/auth/components/Setup2FAForm";
import { useSearchParams } from "next/navigation";

export default function Setup2FAPage() {
  const searchParams = useSearchParams();
  const userId = Number(searchParams.get("userId"));

  if (!userId) {
    return <div>Invalid user</div>;
  }

  return (
    <div className="min-h-screen flex items-center justify-center">
      <Setup2FAForm userId={userId} />
    </div>
  );
}
