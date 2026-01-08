/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useEffect, useRef } from "react";
import {
  useAppDispatch,
  useAppSelector,
} from "@/src/common/hooks/useAppSelector";
import { finishBootstrap, logout } from "@/src/common/storage/auth.slice";
import { clearMe } from "@/src/common/storage/user.slice";
import { socket } from "@/src/common/config/socket";
import { toast } from "sonner";
import { useSingleTabGuard } from "@/src/common/hooks/useSingleTabGuard";

export default function AuthBootstrap({
  children,
}: {
  children: React.ReactNode;
}) {
  const dispatch = useAppDispatch();
  const { me, sessionId } = useAppSelector((s) => s.user);
  const loggedOut = useAppSelector((s) => s.auth.loggedOut);
  const blocked = useSingleTabGuard();
  const ranBootstrap = useRef(false);

  useEffect(() => {
    if (ranBootstrap.current || loggedOut || me) {
      dispatch(finishBootstrap());
      return;
    }

    ranBootstrap.current = true;

    dispatch(finishBootstrap());
  }, [dispatch, me, loggedOut]);

  useEffect(() => {
    if (!sessionId) return;

    const registerSession = () => {
      if (!socket.connected) {
        socket.connect();
        socket.once("connect", () =>
          socket.emit("register_session", sessionId)
        );
      } else {
        socket.emit("register_session", sessionId);
      }
    };

    registerSession();

    return () => {
      socket.off("connect", registerSession);
    };
  }, [sessionId]);

  useEffect(() => {
    const handleForceLogout = async (data: any) => {
      if (data?.sessionId === sessionId) return;

      toast.error(data?.reason ?? "Session expired");

      dispatch(clearMe());
      dispatch(logout());

      if (socket.connected) socket.disconnect();
    };

    socket.on("force_logout", handleForceLogout);
    return () => {
      socket.off("force_logout", handleForceLogout);
    };
  }, [dispatch, sessionId]);

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
          <div className="w-full flex items-center justify-end">
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
