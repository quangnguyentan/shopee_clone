export type AuthScope = "admin" | "seller";
const AUTH_SCOPE_STORAGE_KEY = "admin-console-scope";

export const getAuthScope = (): AuthScope => {
  if (typeof window === "undefined") return "admin";
  if (window.location.pathname.startsWith("/seller")) return "seller";
  if (window.location.pathname.startsWith("/admin")) return "admin";
  return window.localStorage.getItem(AUTH_SCOPE_STORAGE_KEY) === "seller"
    ? "seller"
    : "admin";
};

export const setAuthScope = (scope: AuthScope) => {
  if (typeof window !== "undefined") {
    window.localStorage.setItem(AUTH_SCOPE_STORAGE_KEY, scope);
  }
};

export const AUTH_EXCLUDE_PATHS = [
  "/auth/register",
  "/auth/admin/login",
  "/auth/admin/refresh",
  "/auth/seller/login",
  "/auth/seller/refresh",
  "/auth/logout",
  "/auth/logout-all",
];

export const AUTH_ROUTES = ["/admin/login", "/seller/login", "/admin/signup"];
