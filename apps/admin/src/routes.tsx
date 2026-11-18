/* eslint-disable react-refresh/only-export-components */
// routes.tsx
import { createBrowserRouter } from "react-router-dom";
import { lazy, Suspense } from "react";

import { PublicLayout } from "@/components/PublicLayout";
import { ProtectedLayout } from "@/components/ProtectedLayout";
import Navbar from "@/components/Navbar";
import Loading from "./components/Loading";
import { ProductFormPage } from "./pages/products/components";

const Login = lazy(() => import("@/pages/login"));
const Dashboard = lazy(() => import("@/pages/dashboard"));
const User = lazy(() => import("@/pages/users"));
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
            path: "users",
            element: (
              <S>
                <User />
              </S>
            ),
          },
          {
            path: "users/create",
            element: (
              <S>
                <UserFormPage />
              </S>
            ),
          },
          {
            path: "users/:id/edit",
            element: (
              <S>
                <UserFormPage />
              </S>
            ),
          },
          {
            path: "categories",
            element: (
              <S>
                <Category />
              </S>
            ),
          },
          {
            path: "categories/create",
            element: (
              <S>
                <CategoryFormPage />
              </S>
            ),
          },
          {
            path: "categories/:id/edit",
            element: (
              <S>
                <CategoryFormPage />
              </S>
            ),
          },
          {
            path: "categoryAttributes",
            element: (
              <S>
                <CategoryAttribute />
              </S>
            ),
          },
          {
            path: "categoryAttributes/create",
            element: (
              <S>
                <CategoryAttributeFormPage />
              </S>
            ),
          },
          {
            path: "categoryAttributes/:id/edit",
            element: (
              <S>
                <CategoryAttributeFormPage />
              </S>
            ),
          },
          {
            path: "category-attributes/:attributeId/values",
            element: (
              <S>
                <CategoryAttributeValue />
              </S>
            ),
          },
          {
            path: "category-attributes/:attributeId/values/create",
            element: (
              <S>
                <CategoryAttributeValueFormPage />
              </S>
            ),
          },
          {
            path: "category-attributes/:attributeId/values/:id/edit",
            element: (
              <S>
                <CategoryAttributeValueFormPage />
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
                <ShopFormPage />
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
                <ProductVariantAttribute />
              </S>
            ),
          },
          {
            path: "product-variants/:variantId/attributes/create",
            element: (
              <S>
                <ProductVariantAttributeFormPage />
              </S>
            ),
          },
          {
            path: "product-variants/:variantId/attributes/:id/edit",
            element: (
              <S>
                <ProductVariantAttributeFormPage />
              </S>
            ),
          },
          {
            path: "product-images",
            element: (
              <S>
                <ProductImages />
              </S>
            ),
          },
          {
            path: "product-images/create",
            element: (
              <S>
                <ProductImageFormPage />
              </S>
            ),
          },
          {
            path: "product-images/:id/edit",
            element: (
              <S>
                <ProductImageFormPage />
              </S>
            ),
          },
          {
            path: "product-variants",
            element: (
              <S>
                <ProductVariants />
              </S>
            ),
          },
          {
            path: "product-variants/create",
            element: (
              <S>
                <ProductVariantFormPage />
              </S>
            ),
          },
          {
            path: "product-variants/:id/edit",
            element: (
              <S>
                <ProductVariantFormPage />
              </S>
            ),
          },
          {
            path: "flash-sales",
            element: (
              <S>
                <FlashSales />
              </S>
            ),
          },
          {
            path: "flash-sales/create",
            element: (
              <S>
                <FlashSaleFormPage />
              </S>
            ),
          },
          {
            path: "flash-sales/:id/edit",
            element: (
              <S>
                <FlashSaleFormPage />
              </S>
            ),
          },
          {
            path: "flash-sales/:flashSaleId/items",
            element: (
              <S>
                <FlashSaleItems />
              </S>
            ),
          },
          {
            path: "flash-sales/:flashSaleId/items/create",
            element: (
              <S>
                <FlashSaleItemFormPage />
              </S>
            ),
          },
          {
            path: "flash-sales/:flashSaleId/items/:itemId/edit",
            element: (
              <S>
                <FlashSaleItemFormPage />
              </S>
            ),
          },
        ],
      },
    ],
  },
]);
