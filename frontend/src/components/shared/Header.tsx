"use client";
import logo from "@/src/assest/logo.jpg";
import Image from "next/image";
import i18n from "@/src/lib/locale";
interface HeaderProps {
  isAuth?: boolean;
}
const Header = ({ isAuth = true }: HeaderProps) => {
  return (
    <header>
      {isAuth ? (
        <div className="flex justify-between items-center px-20">
          <div className="flex items-center gap-2">
            <div className="w-[190px] h-[42px] object-cover">
              <Image src={logo} alt="logo" />
            </div>
            <h1 className="font-semibold text-2xl">
              {i18n.get("pages.auth.header.login.title")}
            </h1>
          </div>
          <div>
            <span className="text-red-primary">
              {i18n.get("pages.auth.header.you-need-to-help.title")}
            </span>
          </div>
        </div>
      ) : (
        <div className="fixed top-0 left-0 w-full h-[60px] bg-white shadow-md px-6 z-50"></div>
      )}
    </header>
  );
};

export default Header;
