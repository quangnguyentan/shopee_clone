"use client";
import { useEffect } from "react";
import api, { setAccessToken } from "@/src/common/config/axios";
import { useAppDispatch } from "@/src/common/hooks/useAppSelector";
import { loginSuccess, logout, finishBootstrap } from "../store/auth.slice";

export default function AuthBootstrap({
  children,
}: {
  children: React.ReactNode;
}) {
  const dispatch = useAppDispatch();

  useEffect(() => {
    const bootstrap = async () => {
      try {
        const res = await api.post("/auth/refresh");

        if (res.data?.accessToken) {
          setAccessToken(res.data.accessToken);
          dispatch(loginSuccess());
        } else {
          dispatch(logout());
        }
      } catch {
        dispatch(logout());
      } finally {
        dispatch(finishBootstrap());
      }
    };

    bootstrap();
  }, [dispatch]);

  return <>{children}</>;
}
