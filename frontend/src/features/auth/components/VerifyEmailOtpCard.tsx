"use client";

import { Button } from "@/src/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/src/components/ui/card";
import { Input } from "@/src/components/ui/input";
import { toast } from "sonner";
import { useState } from "react";
import {
  useResendVerifyEmailMutation,
  useVerifyEmailOtpMutation,
} from "@/src/common/api/auth.api";
import { useCooldown } from "../hooks/useCooldown";
import { useNavigate } from "@/src/common/constants/navigate.constant";

export const VerifyEmailOtpCard = ({ email }: { email: string }) => {
  const [otp, setOtp] = useState("");
  const [verifyOtp, { isLoading }] = useVerifyEmailOtpMutation();
  const [resendEmail] = useResendVerifyEmailMutation();
  const { cooldown, setCooldown } = useCooldown(60);
  const { replace } = useNavigate();
  const onVerify = async () => {
    if (otp.length !== 6) {
      toast.error("OTP must be 6 digits");
      return;
    }

    toast.promise(verifyOtp({ email, otp }).unwrap(), {
      loading: "Verifying OTP...",
      success: () => {
        replace("/");
        return "Email verified successfully";
      },
      error: (err) => err?.data?.message || "Invalid or expired OTP",
    });
  };

  const onResend = async () => {
    try {
      const res = await resendEmail({ email }).unwrap();

      if (res.cooldown) {
        setCooldown(res.cooldown);
        toast.warning(`Please wait ${res.cooldown}s before resending`);
        return;
      }

      setCooldown(60);
      toast.success("Verification email sent again");
    } catch (err: A) {
      toast.error(err?.data?.message || "Failed to resend email");
    }
  };

  return (
    <Card className="w-full max-w-[25rem] absolute top-1/2 right-0 -translate-y-1/2 shadow-lg bg-white rounded-sm">
      <CardHeader>
        <CardTitle className="text-xl font-medium">Verify your email</CardTitle>
      </CardHeader>

      <CardContent className="flex flex-col gap-4">
        <p className="text-sm text-muted-foreground">
          Enter the 6-digit code sent to <b>{email}</b>
        </p>

        <Input
          value={otp}
          onChange={(e) => setOtp(e.target.value)}
          placeholder="Enter OTP"
          maxLength={6}
        />

        <Button
          className="bg-red-primary text-white uppercase rounded-sm"
          onClick={onVerify}
          disabled={isLoading}
        >
          Verify
        </Button>

        <Button variant="outline" onClick={onResend} disabled={cooldown > 0}>
          {cooldown > 0 ? `Resend in ${cooldown}s` : "Resend OTP"}
        </Button>
      </CardContent>
    </Card>
  );
};
