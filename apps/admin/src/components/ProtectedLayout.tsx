import { Navigate, Outlet } from "react-router-dom";
import { useAppSelector } from "@/common/hooks/useAppSelector";
import { getAuthScope } from "@/common/constants";
import Loading from "./Loading";

export function ProtectedLayout() {
  const { isAuthenticated, bootstrapped } = useAppSelector((s) => s.auth);
  const role = useAppSelector((s) => s.user.me?.role);

  if (!bootstrapped) return <Loading />;

  if (!isAuthenticated) {
    return <Navigate to={`/${getAuthScope()}/login`} replace />;
  }
  if (role !== "admin" && role !== "seller") {
    return <Navigate to="/admin/login" replace />;
  }

  return <Outlet />;
}
