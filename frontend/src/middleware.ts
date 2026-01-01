import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { AUTH_ROUTES, PROTECTED_ROUTES } from "./common/constants";

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const refreshToken = req.cookies.get("refreshToken");
  const isAuthRoute = AUTH_ROUTES.some((p) => pathname.startsWith(p));
  const isProtectedRoute = PROTECTED_ROUTES.some((p) => pathname.startsWith(p));

  if (refreshToken && isAuthRoute) {
    return NextResponse.redirect(new URL("/", req.url));
  }

  if (!refreshToken && isProtectedRoute) {
    return NextResponse.redirect(new URL("/buyer/login", req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/cart", "/profile/:path*", "/orders/:path*", "/buyer/:path*"],
};
