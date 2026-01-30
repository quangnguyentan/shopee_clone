"use client";

import { useSearchParams } from "next/navigation";
import { VerifyEmailOtpCard } from "@/src/features/auth/components/VerifyEmailOtpCard";

export default function VerifyEmailPage() {
  const params = useSearchParams();
  const email = params.get("email");

  if (!email) return null;

  return <VerifyEmailOtpCard email={email} />;
}
