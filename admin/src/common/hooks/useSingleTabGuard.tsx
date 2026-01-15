import { useEffect, useState } from "react";

const CHANNEL_NAME = "app_single_tab";

export function useSingleTabGuard() {
  const [blocked, setBlocked] = useState(false);

  useEffect(() => {
    const channel = new BroadcastChannel(CHANNEL_NAME);
    const tabId = crypto.randomUUID();

    channel.postMessage({ type: "TAB_OPENED", tabId });

    channel.onmessage = (event) => {
      if (event.data?.type === "TAB_OPENED" && event.data.tabId !== tabId) {
        setBlocked(true);
      }
    };

    return () => {
      channel.close();
    };
  }, []);

  return blocked;
}
