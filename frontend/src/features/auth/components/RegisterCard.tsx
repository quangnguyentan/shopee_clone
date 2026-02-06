/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { Button } from "@/src/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/src/components/ui/card";
import { Form } from "@/src/components/ui/form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import z from "zod";
import { registerSchema } from "../types";
import i18n from "@/src/lib/locale";
import { FormInput } from "@/src/components/shared/FormInput";
import { IconButton } from "@/src/components/shared/IconButton";
import { FaFacebook, FcGoogle } from "@/src/components/shared/Icon";
import { useNavigate } from "@/src/common/constants/navigate.constant";
import { useState, useTransition } from "react";
import { DialogBox } from "@/src/components/shared/Dialog";
import { toast } from "sonner";
import { useRegisterMutation } from "@/src/common/api/auth.api";
import {
  loginWithFacebook,
  loginWithGoogle,
} from "@/src/common/helper/loginRedirect";

const RegisterCard = () => {
  const { push } = useNavigate();

  const [isOpenDialog, setIsOpenDialog] = useState(false);
  const [isPending, startTransition] = useTransition();

  const [register] = useRegisterMutation();

  const form = useForm<z.infer<typeof registerSchema>>({
    resolver: zodResolver(registerSchema),
    mode: "onChange",
    defaultValues: {
      phone: "",
      email: "",
      password: "",
    },
  });

  const isFormValid = form.formState.isValid;

  const onSubmit = (values: z.infer<typeof registerSchema>) => {
    if (!isOpenDialog) return;

    startTransition(async () => {
      try {
        await register(values).unwrap();

        toast.success("OTP has been sent to your email");

        push(`/buyer/verify-email?email=${values.email}`);
      } catch (err: any) {
        toast.error(err?.data?.message || "Register failed");
      }
    });
  };

  const handleContinue = async () => {
    const valid = await form.trigger();
    if (!valid) return;
    setIsOpenDialog(true);
  };

  return (
    <Card className="w-full max-w-[25rem] absolute top-1/2 right-0 -translate-y-1/2 shadow-lg bg-white rounded-sm">
      <CardHeader>
        <CardTitle className="text-xl font-medium">
          {i18n.get("pages.auth.register.title")}
        </CardTitle>
      </CardHeader>

      <CardContent>
        <Form {...form}>
          <form
            id="register-form"
            onSubmit={form.handleSubmit(onSubmit)}
            className="flex flex-col gap-3"
          >
            {/* Phone */}
            <FormInput
              className="px-2 rounded-sm"
              name="phone"
              type="tel"
              placeholder={i18n.get("pages.auth.register.phone.placeholder")}
            />

            <FormInput
              className="px-2 rounded-sm"
              name="email"
              type="email"
              placeholder="Email"
            />

            <FormInput
              className="px-2 rounded-sm"
              name="password"
              type="password"
              placeholder="Password"
            />

            <CardFooter className="flex-col gap-4 !p-0">
              <Button
                type="button"
                onClick={handleContinue}
                disabled={!isFormValid}
                className="w-full bg-red-primary text-white uppercase rounded-sm"
              >
                {i18n.get("pages.auth.register.button-continue")}
              </Button>

              {/* Confirm dialog */}
              <DialogBox
                open={isOpenDialog}
                onOpenChange={setIsOpenDialog}
                className="bg-white rounded-sm"
                footer={
                  <div className="flex justify-center gap-4 py-4">
                    <Button
                      type="button"
                      variant="outline"
                      disabled={isPending}
                      onClick={() => setIsOpenDialog(false)}
                    >
                      Hủy bỏ
                    </Button>
                    <Button
                      type="submit"
                      form="register-form"
                      disabled={isPending}
                    >
                      {isPending ? "Đang gửi..." : "Gửi OTP"}
                    </Button>
                  </div>
                }
              >
                <span className="text-center text-sm font-medium text-grow-primary px-6">
                  Chúng tôi sẽ gửi mã xác minh đến{" "}
                  <b>{form.getValues("email")}</b>
                </span>
              </DialogBox>

              <div className="flex items-center gap-4">
                <div className="flex-1 h-px bg-gray-200" />
                <span className="text-xs text-gray-400 uppercase">OR</span>
                <div className="flex-1 h-px bg-gray-200" />
              </div>

              <div className="flex items-center justify-center gap-2 w-full">
                <IconButton
                  type="button"
                  variant="outline"
                  className="w-full rounded-sm font-normal"
                  startIcon={<FaFacebook color="#1877F2" size={22} />}
                  onClick={loginWithFacebook}
                >
                  {i18n.get("pages.auth.with.facebook.title")}
                </IconButton>
                <IconButton
                  type="button"
                  className="w-full rounded-sm font-normal"
                  variant="outline"
                  startIcon={<FcGoogle size={22} />}
                  onClick={loginWithGoogle}
                >
                  {i18n.get("pages.auth.with.google.title")}
                </IconButton>
              </div>

              {/* Login */}
              <div className="flex justify-center gap-1 text-sm">
                <span className="text-gray-secondary">
                  {i18n.get("pages.auth.description.login.title")}
                </span>
                <span
                  className="text-red-primary cursor-pointer"
                  onClick={() => push("/buyer/login")}
                >
                  {i18n.get("pages.auth.login.title")}
                </span>
              </div>
            </CardFooter>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
};

export default RegisterCard;
