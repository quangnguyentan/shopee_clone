import React, { useState } from "react";
import {
  LogoutOutlined,
  MenuFoldOutlined,
  MenuUnfoldOutlined,
} from "@ant-design/icons";
import { Button, Layout, Menu, theme } from "antd";
import { Outlet, useLocation } from "react-router-dom";
import { NAV_ITEMS } from "../common/utils/nav";
import { useAppNavigate } from "../common/hooks/useNavigate";
import { useLogoutMutation } from "@/common/api/auth.api";
import { useAppDispatch } from "@/common/hooks/useAppSelector";
import { clearMe } from "@/common/storage/user.slice";
import { logout } from "@/common/storage/auth.slice";
import { socket } from "@/common/config/socket";

const { Header, Sider, Content } = Layout;

const Navbar: React.FC = () => {
  const [collapsed, setCollapsed] = useState(false);
  const dispatch = useAppDispatch();
  const [logoutApi] = useLogoutMutation();
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
    token: { colorBgContainer, borderRadiusLG },
  } = theme.useToken();
  const location = useLocation();
  const navigate = useAppNavigate();
  return (
    <Layout className="w-screen h-screen">
      <Sider trigger={null} collapsible collapsed={collapsed}>
        <div className="demo-logo-vertical" />
        <Menu
          selectedKeys={[location.pathname]}
          theme="dark"
          mode="inline"
          defaultSelectedKeys={["1"]}
          items={NAV_ITEMS.map((item) => ({
            ...item,
            onClick: () => navigate(item.url),
          }))}
        />
      </Sider>
      <Layout>
        <Header style={{ padding: 0, background: colorBgContainer }}>
          <div className="flex items-center justify-between">
            <Button
              type="text"
              icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
              onClick={() => setCollapsed(!collapsed)}
              style={{
                fontSize: "16px",
                width: 64,
                height: 64,
              }}
            />
            <LogoutOutlined onClick={handleLogout} />
          </div>
        </Header>
        <Content
          style={{
            margin: "24px 16px",
            padding: 24,
            minHeight: 280,
            background: colorBgContainer,
            borderRadius: borderRadiusLG,
          }}
        >
          <Outlet />
        </Content>
      </Layout>
    </Layout>
  );
};

export default Navbar;
