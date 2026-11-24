"use client";
import Link from "next/link";
import { useLanguage } from "@/src/lib/locale";
import {
  FaFacebook,
  FaInstagram,
  GrLanguage,
  IoIosArrowDown,
  IoIosNotificationsOutline,
  MdOutlineContactSupport,
} from "./Icon";
import icon_notification from "@/src/assest/notifications.png";
import CustomHoverCard from "./CustomHoverCard";
import Image from "next/image";
import {
  LANGUAGE_KEYS,
  LanguageKeys,
  PROFILE_KEYS,
} from "@/src/common/constants";
import { useNavigate } from "@/src/common/constants/navigate.constant";
import { useLogoutMutation } from "@/src/common/api/auth.api";
import { useAppSelector } from "@/src/common/hooks/useAppSelector";
import { getAssetUrl } from "@/src/lib/assets";
import NotificationList from "./NotificationList";

const TopBar = () => {
  const { language, setLanguage, t } = useLanguage();
  const me = useAppSelector((s) => s.user.me);
  const [logout] = useLogoutMutation();
  const { push } = useNavigate();
  const handleChangeLang = (langKey: LanguageKeys) => {
    setLanguage(langKey);
  };
  const renderHoverCard = () => {
    if (!me) {
      return (
        <>
          <span
            onClick={() => push("/buyer/signup")}
            className="cursor-pointer"
          >
            {t("pages.home.topbar.sign-up")}
          </span>
          <div
            onClick={() => push("/buyer/login")}
            className="relative after:absolute after:content-[''] after:h-[14px] after:w-0 after:top-[calc(50%-7px)] 
        after:left-[-9px] after:border-l-[1px] after:border-l-seperator-color 
        after:border-r-[1px] after:border-r-seperator-color cursor-pointer"
          >
            <span>{t("pages.home.topbar.sign-in")}</span>
          </div>
        </>
      );
    } else {
      return (
        <CustomHoverCard
          trigger={
            <div className="flex items-center justify-center gap-2 cursor-pointer">
              <Image
                src={getAssetUrl(me?.avatar) || ""}
                alt={t("pages.home.topbar.profile.avatar-alt")}
                className="rounded-full object-cover"
                width={20}
                height={20}
              />
              <span>{me?.name}</span>
            </div>
          }
          content={
            <div className="flex flex-col gap-2 text-sm">
              {PROFILE_KEYS.map((l) => (
                <span
                  key={l.key}
                  className="cursor-pointer hover:text-red-primary"
                  onClick={async () => {
                    if (l.logout) {
                      await logout().unwrap();
                    } else {
                      push(l.href || "");
                    }
                  }}
                >
                  {t(l.labelId)}
                </span>
              ))}
            </div>
          }
          classNameContent="bg-white w-40"
        />
      );
    }
  };

  return (
    <div className="h-9 flex items-center justify-between">
      <div className="flex items-center justify-center gap-4 text-white text-sm">
        {t("pages.home.topbar.seller-channel")}
        <div
          className="relative after:absolute after:content-[''] after:h-[14px] after:w-0 after:top-[calc(50%-7px)] 
        after:left-[-9px] after:border-l-[1px] after:border-l-seperator-color after:border-r-[1px] after:border-r-seperator-color"
        >
          <span>{t("pages.home.topbar.become-a-seller")}</span>
        </div>
        <div
          className="relative after:absolute after:content-[''] after:h-[14px] after:w-0 after:top-[calc(50%-7px)] 
        after:left-[-9px] after:border-l-[1px] after:border-l-seperator-color after:border-r-[1px] after:border-r-seperator-color"
        >
          <span>{t("pages.home.topbar.download-app")}</span>
        </div>
        <div className="flex items-center justify-center gap-2">
          <div
            className="relative after:absolute after:content-[''] after:h-[14px] after:w-0 after:top-[calc(50%-7px)] 
        after:left-[-9px] after:border-l-[1px] after:border-l-seperator-color after:border-r-[1px] after:border-r-seperator-color"
          >
            <span>{t("pages.home.topbar.connect")}</span>
          </div>
          <FaFacebook size={16} />
          <FaInstagram size={16} />
        </div>
      </div>
      <div className="flex items-center justify-center gap-4 text-white text-sm py-2">
        <CustomHoverCard
          trigger={
            <button
              type="button"
              aria-label={t("pages.home.topbar.notifications")}
              className="relative flex cursor-pointer items-center justify-center gap-1 text-white"
            >
              <IoIosNotificationsOutline size={22} />
              <span>{t("pages.home.topbar.notifications")}</span>
              {me && (
                <span
                  aria-hidden="true"
                  className="absolute -right-1 -top-0.5 size-2 rounded-full border border-red-primary bg-white"
                />
              )}
            </button>
          }
          content={
            me ? (
              <div className="w-[380px] max-w-[calc(100vw-2rem)] overflow-hidden bg-white">
                <div className="border-b px-4 py-3 text-sm text-gray-500">
                  {t("pages.home.topbar.notification.recent-title")}
                </div>
                <div className="max-h-[390px] overflow-y-auto">
                  <NotificationList />
                </div>
                <Link
                  href="/user/notifications"
                  className="flex h-10 items-center justify-center border-t text-sm text-gray-700 hover:bg-gray-50"
                >
                  {t("pages.home.topbar.notification.view-all")}
                </Link>
              </div>
            ) : (
              <div className="flex h-[280px] w-[380px] max-w-[calc(100vw-2rem)] flex-col bg-white">
                <div className="flex flex-1 flex-col items-center justify-center gap-3 text-sm">
                  <Image
                    src={icon_notification}
                    className="size-24"
                    alt={t(
                      "pages.home.topbar.notification.empty-image-alt",
                    )}
                  />
                  <span>{t("pages.home.topbar.notification.hover-title")}</span>
                </div>
                <div className="flex">
                  <Link
                    href="/buyer/login?redirect=%2Fuser%2Fnotifications"
                    className="flex-1 bg-gray-blackground py-3 text-center text-sm hover:bg-gray-primary hover:text-red-primary"
                  >
                    {t("pages.auth.login.button-login")}
                  </Link>
                  <Link
                    href="/buyer/signup"
                    className="flex-1 bg-gray-blackground py-3 text-center text-sm hover:bg-gray-primary hover:text-red-primary"
                  >
                    {t("pages.auth.register.button-register")}
                  </Link>
                </div>
              </div>
            )
          }
          classNameContent="!w-[380px] !max-w-[calc(100vw-2rem)] !p-0 !m-0"
        />
        <div className="flex items-center justify-center gap-1">
          <MdOutlineContactSupport size={20} />
          <span>{t("pages.home.topbar.support")}</span>
        </div>
        <CustomHoverCard
          trigger={
            <div className="flex items-center justify-center gap-1 cursor-pointer">
              <GrLanguage size={16} />
              <span>
                {language === "vi"
                  ? t("pages.home.topbar.vietnamese")
                  : t("pages.home.topbar.english")}
              </span>
              <IoIosArrowDown size={18} />
            </div>
          }
          content={
            <div className="flex flex-col gap-2 text-sm">
              {LANGUAGE_KEYS.map((l) => (
                <span
                  key={l.key}
                  className="cursor-pointer hover:text-red-primary"
                  onClick={() => handleChangeLang(l.key as "vi" | "en")}
                >
                  {t(l.labelId)}
                </span>
              ))}
            </div>
          }
          classNameContent="bg-white w-40"
        />
        {renderHoverCard()}
      </div>
    </div>
  );
};

export default TopBar;
