import { I18nKeys } from "@/src/lib/locale";

export const AUTH_EXCLUDE_PATHS = [
  "/auth/login",
  "/auth/register",
  "/auth/refresh",
  "/auth/2fa",
];

export const AUTH_ROUTES = ["/buyer/login", "/buyer/signup"];
export const PROTECTED_ROUTES = ["/profile", "/orders", "/cart"];

export type LanguageKeys = "vi" | "en";

export const LANGUAGE_KEYS: { key: LanguageKeys; labelId: I18nKeys }[] = [
  { key: "vi", labelId: "pages.home.topbar.vietnamese" },
  { key: "en", labelId: "pages.home.topbar.english" },
];

export type ProfileKeys = "account" | "order" | "logout";

export const PROFILE_KEYS: {
  key: ProfileKeys;
  labelId: I18nKeys;
  href?: string;
  logout?: boolean;
}[] = [
  {
    key: "account",
    labelId: "pages.home.topbar.profile.my-account",
    href: "/user/account/profile",
  },
  {
    key: "order",
    labelId: "pages.home.topbar.profile.my-order",
    href: "/user/purchase",
  },
  { key: "logout", labelId: "pages.home.topbar.profile.logout", logout: true },
];
