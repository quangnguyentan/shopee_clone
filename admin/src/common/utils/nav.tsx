import {
  DashboardOutlined,
  ProductOutlined,
  UserOutlined,
} from "@ant-design/icons";

export const NAV_ITEMS = [
  {
    key: 1,
    icon: <DashboardOutlined />,
    label: "Dashboard",
    url: "/",
  },
  {
    key: 2,
    icon: <UserOutlined />,
    label: "Users",
    url: "/users",
  },
  {
    key: 3,
    icon: <ProductOutlined />,
    label: "Products",
    url: "/products",
  },
];
