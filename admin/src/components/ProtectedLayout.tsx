import { Navigate, Outlet } from "react-router-dom";
import { useAppSelector } from "@/common/hooks/useAppSelector";
import Loading from "./Loading";

export function ProtectedLayout() {
  const { isAuthenticated, bootstrapped } = useAppSelector((s) => s.auth);

  if (!bootstrapped) return <Loading />;

  if (!isAuthenticated) {
    return <Navigate to="/admin/login" replace />;
  }

  return <Outlet />;
}
