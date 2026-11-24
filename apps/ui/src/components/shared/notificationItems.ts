import type { I18nKeys } from "@/src/lib/locale";

export const notificationItems: {
  id: string;
  titleKey: I18nKeys;
  messageKey: I18nKeys;
  href: string;
}[] = [
  {
    id: "offers",
    titleKey: "pages.home.topbar.notification.items.offers.title",
    messageKey: "pages.home.topbar.notification.items.offers.message",
    href: "/daily-discover",
  },
  {
    id: "deals",
    titleKey: "pages.home.topbar.notification.items.deals.title",
    messageKey: "pages.home.topbar.notification.items.deals.message",
    href: "/daily-discover",
  },
  {
    id: "recommendations",
    titleKey: "pages.home.topbar.notification.items.recommendations.title",
    messageKey: "pages.home.topbar.notification.items.recommendations.message",
    href: "/daily-discover",
  },
  {
    id: "vouchers",
    titleKey: "pages.home.topbar.notification.items.vouchers.title",
    messageKey: "pages.home.topbar.notification.items.vouchers.message",
    href: "/daily-discover",
  },
  {
    id: "reminder",
    titleKey: "pages.home.topbar.notification.items.reminder.title",
    messageKey: "pages.home.topbar.notification.items.reminder.message",
    href: "/daily-discover",
  },
];
