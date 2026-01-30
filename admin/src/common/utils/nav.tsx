import {
  BranchesOutlined,
  BuildOutlined,
  DashboardOutlined,
  FileImageOutlined,
  InboxOutlined,
  ProductOutlined,
  ProfileOutlined,
  ShopOutlined,
  UserOutlined,
} from "@ant-design/icons";

export const NAV_ITEMS = [
  {
    key: "/",
    icon: <DashboardOutlined />,
    label: "Dashboard",
    url: "/",
  },
  {
    key: "/users",
    icon: <UserOutlined />,
    label: "Users",
    url: "/users",
  },
  {
    key: "/categories",
    icon: <BranchesOutlined />,
    label: "Categories",
    url: "/categories",
  },
  {
    key: "/categoryAttributes",
    icon: <BuildOutlined />,
    label: "Category Attributes",
    url: "/categoryAttributes",
  },
  {
    key: "/shops",
    icon: <ShopOutlined />,
    label: "Shops",
    url: "/shops",
  },
  {
    key: "/products",
    icon: <ProductOutlined />,
    label: "Products",
    url: "/products",
  },

  {
    key: "/product-images",
    icon: <FileImageOutlined />,
    label: "Product Images",
    url: "/product-images",
  },
  {
    key: "/product-variants",
    icon: <InboxOutlined />,
    label: "Product Variants",
    url: "/product-variants",
  },
  {
    key: "/variant-options",
    icon: <ProfileOutlined />,
    label: "Variant Options",
    url: "/variant-options",
  },
];
