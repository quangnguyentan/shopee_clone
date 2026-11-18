import React, { useEffect, useRef, useState } from "react";
import {
  LogoutOutlined,
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  UserOutlined,
} from "@ant-design/icons";
import { Avatar, Button, Layout, Menu, theme } from "antd";
import { Outlet, useLocation } from "react-router-dom";
import { NAV_ITEMS } from "../common/utils/nav";
import { useAppNavigate } from "../common/hooks/useNavigate";
import { useLogoutMutation } from "@/common/api/auth.api";
import { useAppDispatch, useAppSelector } from "@/common/hooks/useAppSelector";
import { clearMe } from "@/common/storage/user.slice";
import { logout } from "@/common/storage/auth.slice";
import { socket } from "@/common/config/socket";
import Logo from "./Logo";

const { Header, Sider, Content } = Layout;

const Navbar: React.FC = () => {
  const [collapsed, setCollapsed] = useState(false);
  const [isActive, setIsActive] = useState(false);
  const dispatch = useAppDispatch();
  const [logoutApi] = useLogoutMutation();
  const ref = useRef<HTMLDivElement>(null);
  const me = useAppSelector((s) => s.user.me);
  const handleLogout = async () => {
    try {
      await logoutApi().unwrap();
    } catch {
      // ignore – backend có thể đã logout rồi
    } finally {
      dispatch(clearMe());
      dispatch(logout());

      if (socket.connected) socket.disconnect();
    }
  };
  const {
    token: { colorBgContainer },
  } = theme.useToken();
  const location = useLocation();
  const navigate = useAppNavigate();

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setIsActive(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <Layout className="w-screen h-screen overflow-hidden pt-4">
      <Sider
        trigger={null}
        collapsible
        collapsed={collapsed}
        theme="light"
        className="rounded-t-4xl"
        width={300}
      >
        <div className="flex flex-col gap-4 py-4">
          <Logo collapsed={collapsed} />

          <Menu
            selectedKeys={[location.pathname]}
            theme="light"
            mode="inline"
            items={NAV_ITEMS.map((item) => ({
              ...item,
              onClick: () => navigate(item.url),
            }))}
            styles={{
              item: { fontSize: 16, fontWeight: 400, fontFamily: "font-serif" },
              itemIcon: {
                fontSize: 16,
              },
            }}
          />
        </div>
      </Sider>
      <Layout>
        <Header
          className="
            flex items-center justify-between
            rounded-full
            mx-5
            bg-gradient-to-br! from-indigo-500! to-violet-500!
          "
          style={{ padding: 20 }}
        >
          <Button
            type="text"
            icon={
              collapsed ? (
                <MenuUnfoldOutlined className="text-white! text-xl!" />
              ) : (
                <MenuFoldOutlined className="text-white! text-xl!" />
              )
            }
            onClick={() => setCollapsed(!collapsed)}
          />

          <div className="flex items-center justify-center gap-2">
            <div className="relative" ref={ref}>
              <Avatar
                icon={<UserOutlined className="text-black/70!" />}
                className="cursor-pointer bg-gray-100!"
                onClick={() => setIsActive(!isActive)}
                size={35}
              />

              <div
                className={`
                absolute w-40 left-0 z-50 bg-white rounded-lg shadow-lg
                transition-all duration-200 ease-out -translate-x-20
                ${
                  isActive
                    ? "opacity-100 scale-100 translate-y-0 pointer-events-auto"
                    : "opacity-0 scale-95 -translate-y-2 pointer-events-none"
                }
              `}
              >
                <div
                  className="flex items-center justify-between leading-tight py-3 px-4 cursor-pointer hover:bg-gray-100 rounded-lg"
                  onClick={handleLogout}
                >
                  <span className="text-black">Đăng xuất</span>
                  <LogoutOutlined />
                </div>
              </div>
            </div>
            <div className="flex flex-col leading-tight gap-1">
              <span className="text-white font-medium">{me?.name}</span>
              <span className="text-xs text-white">Quản trị viên</span>
            </div>
          </div>
        </Header>

        <Content
          style={{
            margin: "16px 16px 0px 16px",
            padding: 24,
            background: colorBgContainer,
            height: "calc(100vh - 64px)",
            overflowY: "auto",
          }}
        >
          <Outlet />
        </Content>
      </Layout>
    </Layout>
  );
};

export default Navbar;
