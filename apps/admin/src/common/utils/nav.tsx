import {
  BranchesOutlined,
  BuildOutlined,
  DashboardOutlined,
  FileImageOutlined,
  InboxOutlined,
  ProductOutlined,
  ShopOutlined,
  ShoppingCartOutlined,
  StarOutlined,
  TagOutlined,
  ThunderboltOutlined,
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
    key: "/orders",
    icon: <ShoppingCartOutlined />,
    label: "Orders",
    url: "/orders",
  },
  {
    key: "/reviews",
    icon: <StarOutlined />,
    label: "Reviews",
    url: "/reviews",
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
    key: "/flash-sales",
    icon: <ThunderboltOutlined />,
    label: "Flash Sales",
    url: "/flash-sales",
  },
  {
    key: "/vouchers",
    icon: <TagOutlined />,
    label: "Vouchers",
    url: "/vouchers",
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
];
