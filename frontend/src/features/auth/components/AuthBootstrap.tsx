/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useEffect } from "react";
import { useAppDispatch } from "@/src/common/hooks/useAppSelector";
import { loginSuccess, finishBootstrap } from "@/src/common/storage/auth.slice";
import { socket } from "@/src/common/config/socket";
import { toast } from "sonner";
import { useSingleTabGuard } from "@/src/common/hooks/useSingleTabGuard";
import { clearMe, setMe } from "@/src/common/storage/user.slice";
import { useLogoutMutation } from "@/src/common/api/auth.api";
import { createApi } from "@/src/common/api";

export default function AuthBootstrap({
  children,
}: {
  children: React.ReactNode;
}) {
  const dispatch = useAppDispatch();
  const blocked = useSingleTabGuard();
  const [logout] = useLogoutMutation();
  useEffect(() => {
    const bootstrap = async () => {
      const api = createApi();
      try {
        const res = await api.post("/auth/refresh");
        dispatch(loginSuccess());
        dispatch(setMe(res.data.user));
        if (!socket.connected) socket.connect();
        if (res.data.sessionId) {
          socket.emit("register_session", res.data.sessionId);
        }
      } catch {
        dispatch(clearMe());
        socket.disconnect();
      } finally {
        dispatch(finishBootstrap());
      }
    };

    bootstrap();
  }, [dispatch]);

  useEffect(() => {
    const onForceLogout = async (data: any) => {
      toast.error(data?.reason ?? "Session expired");
      if (socket.connected) {
        socket.disconnect();
      }
      dispatch(clearMe());
    };
    socket.on("force_logout", onForceLogout);

    return () => {
      socket.off("force_logout", onForceLogout);
    };
  }, [dispatch]);

  if (blocked) {
    return (
      <div className="fixed inset-0 bg-black/40 flex items-center justify-center">
        <div className="bg-white p-6 rounded shadow-md">
          <h3 className="text-lg font-semibold mb-2">
            Bạn đang mở ứng dụng ở tab khác hoặc quá lâu không sử dụng ứng dụng
          </h3>
          <p className="text-[16] my-4">
            Nhấn kích hoạt để sử dụng tại tab này
          </p>
          <div className="w-full flex items-center justify-end ">
            <button
              onClick={() => window.location.reload()}
              className="px-4 py-2 bg-blue-600 text-white rounded"
            >
              Kích hoạt
            </button>
          </div>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
