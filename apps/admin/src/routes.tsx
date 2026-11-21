/* eslint-disable react-refresh/only-export-components */
// routes.tsx
import { createBrowserRouter } from "react-router-dom";
import { lazy, Suspense } from "react";

import { PublicLayout } from "@/components/PublicLayout";
import { ProtectedLayout } from "@/components/ProtectedLayout";
import RoleGuard from "@/components/RoleGuard";
import Navbar from "@/components/Navbar";
import Loading from "./components/Loading";
import { ProductFormPage } from "./pages/products/components";

const Login = lazy(() => import("@/pages/login"));
const Dashboard = lazy(() => import("@/pages/dashboard"));
const User = lazy(() => import("@/pages/users"));
const Orders = lazy(() => import("@/pages/orders"));
const Vouchers = lazy(() => import("@/pages/vouchers"));
const Reviews = lazy(() => import("@/pages/reviews"));
const Category = lazy(() => import("@/pages/category"));
const CategoryAttribute = lazy(() => import("@/pages/category-attribute"));
const CategoryAttributeValue = lazy(
  () => import("@/pages/category-attribute-value"),
);

const Products = lazy(() => import("@/pages/products"));
const Shops = lazy(() => import("@/pages/shops"));
const ProductVariants = lazy(() => import("@/pages/product-variants"));
const ProductImages = lazy(() => import("@/pages/product-images"));
const ShopFormPage = lazy(() =>
  import("@/pages/shops/components").then((mod) => ({
    default: mod.ShopFormPage,
  })),
);
const ProductVariantAttribute = lazy(
  () => import("@/pages/product-variant-attribute"),
);

const FlashSales = lazy(() => import("@/pages/flash-sales"));
const FlashSaleItems = lazy(() => import("@/pages/flash-sale-items"));
const FlashSaleFormPage = lazy(() =>
  import("@/pages/flash-sales/components").then((m) => ({
    default: m.FlashSaleFormPage,
  })),
);
const FlashSaleItemFormPage = lazy(() =>
  import("@/pages/flash-sale-items/components").then((m) => ({
    default: m.FlashSaleItemFormPage,
  })),
);

import { ProductImageFormPage } from "./pages/product-images/components";
import { ProductVariantFormPage } from "./pages/product-variants/components";
import { UserFormPage } from "./pages/users/components";
import { CategoryFormPage } from "./pages/category/components";
import { CategoryAttributeFormPage } from "./pages/category-attribute/components";
import { CategoryAttributeValueFormPage } from "./pages/category-attribute-value/components";
import { ProductVariantAttributeFormPage } from "./pages/product-variant-attribute/components";

const S = ({ children }: { children: React.ReactNode }) => (
  <Suspense fallback={<Loading />}>{children}</Suspense>
);

const AdminOnly = ({ children }: { children: React.ReactNode }) => (
  <RoleGuard roles={["admin"]}>{children}</RoleGuard>
);

export const router = createBrowserRouter([
  {
    element: (
      <S>
        <PublicLayout />
      </S>
    ),
    children: [
      {
        path: "admin/login",
        element: (
          <S>
            <Login />
          </S>
        ),
      },
      {
        path: "seller/login",
        element: (
          <S>
            <Login />
          </S>
        ),
      },
    ],
  },
  {
    element: (
      <S>
        <ProtectedLayout />
      </S>
    ),
    children: [
      {
        element: (
          <S>
            <Navbar />
          </S>
        ),
        children: [
          {
            index: true,
            element: (
              <S>
                <Dashboard />
              </S>
            ),
          },
          {
            path: "orders",
            element: (
              <S>
                <RoleGuard roles={["admin", "seller"]}>
                  <Orders />
                </RoleGuard>
              </S>
            ),
          },
          {
            path: "vouchers",
            element: (
              <S>
                <RoleGuard roles={["admin", "seller"]}>
                  <Vouchers />
                </RoleGuard>
              </S>
            ),
          },
          {
            path: "reviews",
            element: (
              <S>
                <RoleGuard roles={["admin", "seller"]}>
                  <Reviews />
                </RoleGuard>
              </S>
            ),
          },
          {
            path: "users",
            element: (
              <S>
                <AdminOnly>
                  <User />
                </AdminOnly>
              </S>
            ),
          },
          {
            path: "users/create",
            element: (
              <S>
                <AdminOnly>
                  <UserFormPage />
                </AdminOnly>
              </S>
            ),
          },
          {
            path: "users/:id/edit",
            element: (
              <S>
                <AdminOnly>
                  <UserFormPage />
                </AdminOnly>
              </S>
            ),
          },
          {
            path: "categories",
            element: (
              <S>
                <AdminOnly>
                  <Category />
                </AdminOnly>
              </S>
            ),
          },
          {
            path: "categories/create",
            element: (
              <S>
                <AdminOnly>
                  <CategoryFormPage />
                </AdminOnly>
              </S>
            ),
          },
          {
            path: "categories/:id/edit",
            element: (
              <S>
                <AdminOnly>
                  <CategoryFormPage />
                </AdminOnly>
              </S>
            ),
          },
          {
            path: "categoryAttributes",
            element: (
              <S>
                <AdminOnly>
                  <CategoryAttribute />
                </AdminOnly>
              </S>
            ),
          },
          {
            path: "categoryAttributes/create",
            element: (
              <S>
                <AdminOnly>
                  <CategoryAttributeFormPage />
                </AdminOnly>
              </S>
            ),
          },
          {
            path: "categoryAttributes/:id/edit",
            element: (
              <S>
                <AdminOnly>
                  <CategoryAttributeFormPage />
                </AdminOnly>
              </S>
            ),
          },
          {
            path: "category-attributes/:attributeId/values",
            element: (
              <S>
                <AdminOnly>
                  <CategoryAttributeValue />
                </AdminOnly>
              </S>
            ),
          },
          {
            path: "category-attributes/:attributeId/values/create",
            element: (
              <S>
                <AdminOnly>
                  <CategoryAttributeValueFormPage />
                </AdminOnly>
              </S>
            ),
          },
          {
            path: "category-attributes/:attributeId/values/:id/edit",
            element: (
              <S>
                <AdminOnly>
                  <CategoryAttributeValueFormPage />
                </AdminOnly>
              </S>
            ),
          },
          {
            path: "products",
            element: (
              <S>
                <Products />
              </S>
            ),
          },
          {
            path: "products/create",
            element: (
              <S>
                <ProductFormPage />
              </S>
            ),
          },
          {
            path: "products/:id/edit",
            element: (
              <S>
                <ProductFormPage />
              </S>
            ),
          },
          {
            path: "shops",
            element: (
              <S>
                <Shops />
              </S>
            ),
          },
          {
            path: "shops/create",
            element: (
              <S>
                <AdminOnly>
                  <ShopFormPage />
                </AdminOnly>
              </S>
            ),
          },
          {
            path: "shops/:id/edit",
            element: (
              <S>
                <ShopFormPage />
              </S>
            ),
          },
          {
            path: "productVariantAttributes",
            element: (
              <S>
                <AdminOnly>
                  <ProductVariantAttribute />
                </AdminOnly>
              </S>
            ),
          },
          {
            path: "product-variants/:variantId/attributes/create",
            element: (
              <S>
                <AdminOnly>
                  <ProductVariantAttributeFormPage />
                </AdminOnly>
              </S>
            ),
          },
          {
            path: "product-variants/:variantId/attributes/:id/edit",
            element: (
              <S>
                <AdminOnly>
                  <ProductVariantAttributeFormPage />
                </AdminOnly>
              </S>
            ),
          },
          {
            path: "product-images",
            element: (
              <S>
                <AdminOnly>
                  <ProductImages />
                </AdminOnly>
              </S>
            ),
          },
          {
            path: "product-images/create",
            element: (
              <S>
                <AdminOnly>
                  <ProductImageFormPage />
                </AdminOnly>
              </S>
            ),
          },
          {
            path: "product-images/:id/edit",
            element: (
              <S>
                <AdminOnly>
                  <ProductImageFormPage />
                </AdminOnly>
              </S>
            ),
          },
          {
            path: "product-variants",
            element: (
              <S>
                <AdminOnly>
                  <ProductVariants />
                </AdminOnly>
              </S>
            ),
          },
          {
            path: "product-variants/create",
            element: (
              <S>
                <AdminOnly>
                  <ProductVariantFormPage />
                </AdminOnly>
              </S>
            ),
          },
          {
            path: "product-variants/:id/edit",
            element: (
              <S>
                <AdminOnly>
                  <ProductVariantFormPage />
                </AdminOnly>
              </S>
            ),
          },
          {
            path: "flash-sales",
            element: (
              <S>
                <AdminOnly>
                  <FlashSales />
                </AdminOnly>
              </S>
            ),
          },
          {
            path: "flash-sales/create",
            element: (
              <S>
                <AdminOnly>
                  <FlashSaleFormPage />
                </AdminOnly>
              </S>
            ),
          },
          {
            path: "flash-sales/:id/edit",
            element: (
              <S>
                <AdminOnly>
                  <FlashSaleFormPage />
                </AdminOnly>
              </S>
            ),
          },
          {
            path: "flash-sales/:flashSaleId/items",
            element: (
              <S>
                <AdminOnly>
                  <FlashSaleItems />
                </AdminOnly>
              </S>
            ),
          },
          {
            path: "flash-sales/:flashSaleId/items/create",
            element: (
              <S>
                <AdminOnly>
                  <FlashSaleItemFormPage />
                </AdminOnly>
              </S>
            ),
          },
          {
            path: "flash-sales/:flashSaleId/items/:itemId/edit",
            element: (
              <S>
                <AdminOnly>
                  <FlashSaleItemFormPage />
                </AdminOnly>
              </S>
            ),
          },
        ],
      },
    ],
  },
]);
