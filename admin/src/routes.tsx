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
const Products = lazy(() => import("@/pages/products"));
const Shops = lazy(() => import("@/pages/shops"));
const ProductVariants = lazy(() => import("@/pages/product-variants"));
const ProductImages = lazy(() => import("@/pages/product-images"));
const VariantOptions = lazy(() => import("@/pages/variant-options"));
const ShopFormPage = lazy(() =>
  import("@/pages/shops/components").then((mod) => ({
    default: mod.ShopFormPage,
  })),
);
import { VariantOptionFormPage } from "./pages/variant-options/components";
import { ProductImageFormPage } from "./pages/product-images/components";
import { ProductVariantFormPage } from "./pages/product-variants/components";

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
            path: "variant-options",
            element: (
              <S>
                <VariantOptions />
              </S>
            ),
          },
          {
            path: "variant-options/create",
            element: (
              <S>
                <VariantOptionFormPage />
              </S>
            ),
          },
          {
            path: "variant-options/:id/edit",
            element: (
              <S>
                <VariantOptionFormPage />
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
        ],
      },
    ],
  },
]);
