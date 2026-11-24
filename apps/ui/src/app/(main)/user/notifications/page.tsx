"use client";

import NotificationList from "@/src/components/shared/NotificationList";
import { useLanguage } from "@/src/lib/locale";

const NotificationsPage = () => {
  const { t } = useLanguage();

  return (
    <main className="mx-auto max-w-screen-xl px-4 py-8 sm:px-8">
      <h1 className="mb-4 text-xl font-medium text-gray-800">
        {t("pages.home.topbar.notification.page-title")}
      </h1>
      <section className="overflow-hidden rounded-sm bg-white shadow-sm">
        <NotificationList />
      </section>
    </main>
  );
};

export default NotificationsPage;
