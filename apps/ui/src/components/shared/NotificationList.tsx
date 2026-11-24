"use client";

import Link from "next/link";
import { SiShopee } from "./Icon";
import { useLanguage } from "@/src/lib/locale";
import { notificationItems } from "./notificationItems";

const NotificationList = () => {
  const { t } = useLanguage();

  return (
    <div>
      {notificationItems.map((item) => (
        <Link
          key={item.id}
          href={item.href}
          className="flex gap-3 bg-[#fff3f0] px-3 py-2.5 transition-colors hover:bg-[#ffe9e3]"
        >
          <span
            aria-hidden="true"
            className="flex size-10 shrink-0 items-center justify-center bg-[#ee4d2d] text-white"
          >
            <SiShopee size={25} />
          </span>
          <span className="min-w-0">
            <span className="block text-sm font-medium leading-5 text-gray-800">
              {t(item.titleKey)}
            </span>
            <span className="mt-0.5 block text-xs leading-4 text-gray-500">
              {t(item.messageKey)}
            </span>
          </span>
        </Link>
      ))}
    </div>
  );
};

export default NotificationList;
