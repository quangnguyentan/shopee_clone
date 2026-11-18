import { useEffect } from "react";

interface UseResendCountDownProps {
  resendCountDown: number;
  setResendCountDown: React.Dispatch<React.SetStateAction<number>>;
}

export const useResendCountDown = ({
  resendCountDown,
  setResendCountDown,
}: UseResendCountDownProps) => {
  useEffect(() => {
    if (resendCountDown <= 0) return;

    const timer = setTimeout(() => {
      setResendCountDown((prev) => prev - 1);
    }, 1000);

    return () => clearTimeout(timer);
  }, [resendCountDown, setResendCountDown]);
};
