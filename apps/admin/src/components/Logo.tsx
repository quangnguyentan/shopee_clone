import { Image } from "antd";
import logo from "@/assets/auth_logo.png";
import logo_mini from "@/assets/mini_logo.png";
import { useNavigate } from "react-router-dom";

const Logo = ({ collapsed }: { collapsed: boolean }) => {
  const navigate = useNavigate();
  const handleRedirect = () => {
    navigate("/");
  };
  return (
    <div className="relative h-12 flex items-center justify-center px-4">
      {collapsed && (
        <Image
          src={logo_mini}
          alt="logo-mini"
          width={35}
          height={35}
          preview={false}
          className="transition-opacity duration-200 cursor-pointer"
          onClick={handleRedirect}
        />
      )}

      {!collapsed && (
        <div
          onClick={handleRedirect}
          className="flex items-center gap-2 transition-opacity duration-200 cursor-pointer"
        >
          <Image
            src={logo_mini}
            alt="logo"
            width={35}
            height={35}
            preview={false}
            className="shrink-0"
          />

          <div className="flex flex-col leading-tight">
            <div className="flex items-center gap-1">
              <Image
                src={logo}
                alt="mini-logo"
                width={14}
                height={14}
                preview={false}
              />
              <span className="text-[12px] font-light text-red-500">
                Shopee admin
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Logo;
