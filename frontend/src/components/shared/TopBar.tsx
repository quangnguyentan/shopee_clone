"use client";
import i18n from "@/src/lib/locale";
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
import { Button } from "../ui/button";
import {
  LANGUAGE_KEYS,
  LanguageKeys,
  PROFILE_KEYS,
} from "@/src/common/constants";
import { useMemo, useState } from "react";
import { useNavigate } from "@/src/common/constants/navigate.constant";
import { useLogoutMutation } from "@/src/common/api/auth.api";
import { useAppSelector } from "@/src/common/hooks/useAppSelector";
import { getAssetUrl } from "@/src/lib/assets";

const TopBar = () => {
  const [, setLangState] = useState(i18n.getLanguage());
  const me = useAppSelector((s) => s.user.me);
  const [logout] = useLogoutMutation();
  const { push } = useNavigate();
  const handleChangeLang = (langKey: LanguageKeys) => {
    i18n.setLanguage(langKey);
    setLangState(langKey);
  };
  const renderHoverCard = useMemo(() => {
    if (!me) {
      return (
        <>
          <span
            onClick={() => push("/buyer/signup")}
            className="cursor-pointer"
          >
            {i18n.get("pages.home.topbar.sign-up")}
          </span>
          <div
            onClick={() => push("/buyer/login")}
            className="relative after:absolute after:content-[''] after:h-[14px] after:w-0 after:top-[calc(50%-7px)] 
        after:left-[-9px] after:border-l-[1px] after:border-l-seperator-color 
        after:border-r-[1px] after:border-r-seperator-color cursor-pointer"
          >
            <span>{i18n.get("pages.home.topbar.sign-in")}</span>
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
                alt="avatar"
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
                  {i18n.get(l?.labelId)}
                </span>
              ))}
            </div>
          }
          classNameContent="bg-white w-40"
        />
      );
    }
  }, [me, logout, push]);

  return (
    <div className="h-9 flex items-center justify-between">
      <div className="flex items-center justify-center gap-4 text-white text-sm">
        {i18n.get("pages.home.topbar.seller-channel")}
        <div
          className="relative after:absolute after:content-[''] after:h-[14px] after:w-0 after:top-[calc(50%-7px)] 
        after:left-[-9px] after:border-l-[1px] after:border-l-seperator-color after:border-r-[1px] after:border-r-seperator-color"
        >
          <span>{i18n.get("pages.home.topbar.become-a-seller")}</span>
        </div>
        <div
          className="relative after:absolute after:content-[''] after:h-[14px] after:w-0 after:top-[calc(50%-7px)] 
        after:left-[-9px] after:border-l-[1px] after:border-l-seperator-color after:border-r-[1px] after:border-r-seperator-color"
        >
          <span>{i18n.get("pages.home.topbar.download-app")}</span>
        </div>
        <div className="flex items-center justify-center gap-2">
          <div
            className="relative after:absolute after:content-[''] after:h-[14px] after:w-0 after:top-[calc(50%-7px)] 
        after:left-[-9px] after:border-l-[1px] after:border-l-seperator-color after:border-r-[1px] after:border-r-seperator-color"
          >
            <span>{i18n.get("pages.home.topbar.connect")}</span>
          </div>
          <FaFacebook size={16} />
          <FaInstagram size={16} />
        </div>
      </div>
      <div className="flex items-center justify-center gap-4 text-white text-sm py-2">
        <CustomHoverCard
          trigger={
            <div className="flex items-center justify-center gap-1 cursor-pointer">
              <IoIosNotificationsOutline size={22} />
              <span>{i18n.get("pages.home.topbar.notifications")}</span>
            </div>
          }
          content={
            <div className="flex flex-col w-full h-full">
              <div className="flex items-center justify-center flex-9 flex-col text-sm">
                <Image
                  src={icon_notification}
                  className="w-24 h-24"
                  alt="icon-notification"
                />
                <span>
                  {i18n.get("pages.home.topbar.notification.hover-title")}
                </span>
              </div>
              <div className="flex items-center flex-1 w-full ">
                <Button className="bg-gray-blackground flex-1 rounded-none hover:bg-gray-primary hover:text-red-primary">
                  {i18n.get("pages.auth.login.button-login")}
                </Button>
                <Button className="bg-gray-blackground flex-1 rounded-none hover:bg-gray-primary hover:text-red-primary">
                  {i18n.get("pages.auth.register.button-register")}
                </Button>
              </div>
            </div>
          }
          classNameContent="w-[400px] h-[300px] bg-white !p-0 !m-0"
        />
        <div className="flex items-center justify-center gap-1">
          <MdOutlineContactSupport size={20} />
          <span>{i18n.get("pages.home.topbar.support")}</span>
        </div>
        <CustomHoverCard
          trigger={
            <div className="flex items-center justify-center gap-1 cursor-pointer">
              <GrLanguage size={16} />
              <span>
                {i18n.getLanguage() === "vi"
                  ? i18n.get("pages.home.topbar.vietnamese")
                  : i18n.get("pages.home.topbar.english")}
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
                  {i18n.get(l?.labelId)}
                </span>
              ))}
            </div>
          }
          classNameContent="bg-white w-40"
        />
        {renderHoverCard}
      </div>
    </div>
  );
};

export default TopBar;
