import { Navigate } from "react-router-dom";
import { useAppSelector } from "@/common/hooks/useAppSelector";

type RoleGuardProps = {
  roles: Array<"admin" | "seller">;
  children: React.ReactNode;
};

export default function RoleGuard({ roles, children }: RoleGuardProps) {
  const role = useAppSelector((state) => state.user.me?.role);

  if (
    (role !== "admin" && role !== "seller") ||
    !roles.includes(role)
  ) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
}
