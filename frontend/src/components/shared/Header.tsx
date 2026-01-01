"use client";
import i18n from "@/src/lib/locale";
import { useAppSelector } from "@/src/common/hooks/useAppSelector";
import { useMemo } from "react";
import { CiSearch, LuShoppingCart, useShopeeLogo } from "./Icon";
import TopBar from "./TopBar";
import { FormInput } from "./FormInput";
import { IconInput } from "./IconInput";
const Header = () => {
  const { isAuthenticated } = useAppSelector((s) => s.auth);
  const { isAuthRoute, location, logo, push } = useShopeeLogo();
  console.log(isAuthRoute, "isAuthRoute");
  const renderTitle = useMemo(() => {
    if (location.includes("/buyer/login")) {
      return i18n.get("pages.auth.header.login.title");
    } else {
      return i18n.get("pages.auth.header.register.title");
    }
  }, [location]);

  if (isAuthRoute) {
    return (
      <header>
        <div className="h-20 px-6 lg:px-24 max-w-screen-xl mx-auto flex justify-between items-center">
          <div className="flex items-center justify-center gap-4">
            {logo}
            <h1 className="text-2xl font-normal">{renderTitle}</h1>
          </div>
          <div>
            <span className="text-red-primary">
              {i18n.get("pages.auth.header.you-need-to-help.title")}
            </span>
          </div>
        </div>
      </header>
    );
  }
  return (
    <div className="bg-red-primary fixed w-full">
      <header className="h-[7.4375rem] px-6 lg:px-24 max-w-screen-xl mx-auto flex flex-col ">
        <TopBar />
        <div className="flex items-center justify-between">
          <div className="flex-2">{logo}</div>
          <div className="flex-6 flex flex-col gap-3">
            <IconInput
              endIcon={<CiSearch />}
              placeholder={i18n.get("pages.home.header.search.placeholder")}
              className="bg-white rounded-sm py-5 px-3"
            />
          </div>
          <div className="flex-2 flex items-center justify-center">
            <LuShoppingCart color="white" className="w-7 h-7" />
          </div>
        </div>
      </header>
    </div>
  );
};

export default Header;
