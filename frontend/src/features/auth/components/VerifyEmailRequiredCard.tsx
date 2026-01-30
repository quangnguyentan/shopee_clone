"use client";

import { Button } from "@/src/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/src/components/ui/card";
import { toast } from "sonner";
import { useNavigate } from "@/src/common/constants/navigate.constant";
import { useResendVerifyEmailMutation } from "@/src/common/api/auth.api";
import { useCooldown } from "../hooks/useCooldown";
import i18n from "@/src/lib/locale";

type Props = {
  email: string;
};

export const VerifyEmailRequiredCard = ({ email }: Props) => {
  const { push } = useNavigate();
  const [resend] = useResendVerifyEmailMutation();
  const { cooldown, setCooldown } = useCooldown(60);

  const onResend = async () => {
    try {
      const res = await resend({ email }).unwrap();

      if (res.cooldown) {
        setCooldown(res.cooldown);
        toast.warning(`Please wait ${res.cooldown}s`);
        return;
      }

      setCooldown(60);
      toast.success("Verification email sent");
      push("/buyer/login");
    } catch (err: A) {
      toast.error(err?.data?.message || "Failed to resend email");
    }
  };

  return (
    <Card className="w-full max-w-[25rem] absolute top-1/2 right-0 -translate-y-1/2 shadow-lg bg-white rounded-sm">
      <CardHeader>
        <CardTitle className="text-xl font-medium text-red-primary">
          Verify your email
        </CardTitle>
      </CardHeader>

      <CardContent className="text-sm text-muted-foreground">
        {i18n.get("pages.auth.verify.required", {
          email: email,
        })}
      </CardContent>

      <CardFooter className="flex flex-col gap-3">
        <Button
          className="w-full bg-red-primary text-white"
          onClick={() => push(`/buyer/verify-email?email=${email}`)}
        >
          Verify now
        </Button>

        <Button variant="outline" disabled={cooldown > 0} onClick={onResend}>
          {cooldown > 0
            ? `Resend in ${cooldown}s`
            : "Resend verification email"}
        </Button>
      </CardFooter>
    </Card>
  );
};
