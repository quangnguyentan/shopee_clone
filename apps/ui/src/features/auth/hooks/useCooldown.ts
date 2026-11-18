import { useEffect, useState } from "react";

export function useCooldown(initial = 0) {
  const [cooldown, setCooldown] = useState(initial);

  useEffect(() => {
    if (cooldown <= 0) return;
    const timer = setInterval(() => {
      setCooldown((c) => c - 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [cooldown]);

  return { cooldown, setCooldown };
}
