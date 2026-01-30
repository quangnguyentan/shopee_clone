export const AUTH_SCOPE = "admin" as const;
export const AUTH_EXCLUDE_PATHS = [
  "/auth/register",
  `/auth/${AUTH_SCOPE}/login`,
  `/auth/${AUTH_SCOPE}/refresh`,
  "/auth/logout",
  "/auth/logout-all",
];

export const AUTH_ROUTES = ["/admin/login", "/admin/signup"];
