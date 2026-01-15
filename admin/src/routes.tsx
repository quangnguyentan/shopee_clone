/* eslint-disable react-refresh/only-export-components */
// routes.tsx
import { createBrowserRouter } from "react-router-dom";
import { lazy, Suspense } from "react";

import { PublicLayout } from "@/components/PublicLayout";
import { ProtectedLayout } from "@/components/ProtectedLayout";
import Navbar from "@/components/Nav";
import Loading from "./components/Loading";

const Login = lazy(() => import("@/pages/login"));
const Dashboard = lazy(() => import("@/pages/dashboard"));
const User = lazy(() => import("@/pages/users"));
const Products = lazy(() => import("@/pages/products"));

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
        ],
      },
    ],
  },
]);
