"use client";
import i18n from "@/src/lib/locale";
import { useMemo } from "react";
import { CiSearch, LuShoppingCart, useShopeeLogo } from "./Icon";
import TopBar from "./TopBar";
import { IconInput } from "./IconInput";
export const HEADER_HEIGHT = 119;
const Header = () => {
  const { isAuthRoute, location, logo } = useShopeeLogo();
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
      <header className="h-[119px] px-6 lg:px-24 max-w-screen-xl mx-auto flex flex-col ">
        <TopBar />
        <div className="flex items-center justify-between w-full h-full py-2 gap-2">
          <div className="flex-2">{logo}</div>
          <div className="flex-7 flex flex-col gap-1">
            <IconInput
              endIcon={<CiSearch />}
              placeholder={i18n.get("pages.home.header.search.placeholder")}
              className="bg-white rounded-sm py-5 px-3"
            />
            <div className="flex items-center gap-3 text-white text-xs">
              <span>Sục Crocs</span>
              <span>Áo khoác name đẹp</span>
            </div>
          </div>
          <div className="flex-1 flex items-center justify-center">
            <LuShoppingCart color="white" className="w-7 h-7" />
          </div>
        </div>
      </header>
    </div>
  );
};

export default Header;
