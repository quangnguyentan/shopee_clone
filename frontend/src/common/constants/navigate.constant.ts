"use client";

import { useRouter } from "next/navigation";

export const useNavigate = () => {
  const router = useRouter();

  const push = (path: string) => {
    router.push(path);
  };

  const replace = (path: string) => {
    router.replace(path);
  };

  const back = () => {
    router.back();
  };

  return {
    push,
    replace,
    back,
  };
};
