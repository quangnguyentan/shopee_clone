import { useEffect, useRef } from "react";
import { toast } from "sonner";

import { refreshApi } from "@/common/config/refreshApi";
import { socket } from "@/common/config/socket";
import { useAppDispatch, useAppSelector } from "@/common/hooks/useAppSelector";
import {
  finishBootstrap,
  loginSuccess,
  logout,
  startBootstrap,
} from "@/common/storage/auth.slice";
import { clearMe, setMe } from "@/common/storage/user.slice";
import { persistor } from "@/common/storage";
import { useSingleTabGuard } from "@/common/hooks/useSingleTabGuard";
import Loading from "./Loading";

export default function AuthBootstrap({
  children,
}: {
  children: React.ReactNode;
}) {
  const dispatch = useAppDispatch();
  const ran = useRef(false);
  const blocked = useSingleTabGuard();

  const { bootstrapped } = useAppSelector((s) => s.auth);
  const sessionId = useAppSelector((s) => s.user.sessionId);

  useEffect(() => {
    if (ran.current) return;
    ran.current = true;
    dispatch(startBootstrap());
    (async () => {
      try {
        const res = await refreshApi.refresh();
        const { authenticated, user, sessionId } = res.data;

        if (!authenticated) throw new Error();

        dispatch(setMe({ user, sessionId }));
        dispatch(loginSuccess());
      } catch {
        dispatch(clearMe());
        dispatch(logout());
      } finally {
        dispatch(finishBootstrap());
      }
    })();
  }, [dispatch]);

  useEffect(() => {
    if (!sessionId) return;

    if (!socket.connected) {
      socket.connect();
      socket.once("connect", () => socket.emit("register_session", sessionId));
    } else {
      socket.emit("register_session", sessionId);
    }
  }, [sessionId]);

  useEffect(() => {
    const handleForceLogout = (data: A) => {
      if (data?.sessionId === sessionId) return;

      toast.error(data?.reason ?? "Session expired");
      dispatch(clearMe());
      dispatch(logout());
      persistor.purge();

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

  if (!bootstrapped) return <Loading />;

  return <>{children}</>;
}
