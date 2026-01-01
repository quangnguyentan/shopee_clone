"use client";
import { Loading } from "@/src/components/shared/Loading";
import { useAppSelector } from "../hooks/useAppSelector";

export default function AuthProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const { bootstrapped } = useAppSelector((s) => s.auth);
  if (!bootstrapped) return <Loading />;

  return <>{children}</>;
}
