"use client";

import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useAppSelector } from "@/src/common/hooks/useAppSelector";
import { AUTH_ROUTES, PROTECTED_ROUTES } from "@/src/common/constants";
import { Loading } from "./Loading";

export default function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const { isAuthenticated, bootstrapped } = useAppSelector((s) => s.auth);
  const isAuthRoute = AUTH_ROUTES.some((r) => pathname.startsWith(r));
  const isProtectedRoute = PROTECTED_ROUTES.some((r) => pathname.startsWith(r));
  useEffect(() => {
    if (!bootstrapped) return;

    if (!isAuthenticated && isProtectedRoute) {
      router.replace("/buyer/login");
    }

    if (isAuthenticated && isAuthRoute) {
      router.replace("/");
    }
  }, [bootstrapped, isAuthenticated, isAuthRoute, isProtectedRoute, router]);

  if (!bootstrapped) return <Loading />;
  if (
    bootstrapped &&
    ((isAuthenticated && isAuthRoute) || (!isAuthenticated && isProtectedRoute))
  )
    return <Loading />;

  return children;
}
