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
import ReCAPTCHA from "react-google-recaptcha";
import { useRef, useState, useTransition } from "react";
import { DialogBox } from "@/src/components/shared/Dialog";
import { Separator } from "@/src/components/ui/separator";

import { useResendCountDown } from "../hooks/useResendCountdown";
import { Loading } from "@/src/components/shared/Loading";
const RegisterCard = () => {
  const { push } = useNavigate();
  const [isOpenDialog, setIsOpenDialog] = useState(false);
  const [resendCountDown, setResendCountDown] = useState(0);

  const [isPending, startTransition] = useTransition();
  const form = useForm<z.infer<typeof registerSchema>>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      phone: "",
    },
  });
  const { setError } = form;
  const isFormValid = form.formState.isValid;
  useResendCountDown({
    resendCountDown,
    setResendCountDown,
  });
  // 2. Define a submit handler.
  function onSubmit(values: z.infer<typeof registerSchema>) {
    console.log(isOpenDialog, "isOpenDialog");
    if (!isOpenDialog) return;
  }

  const handleContinue = async () => {
    const valid = await form.trigger();
    if (!valid) return;
    setIsOpenDialog(true);
  };

  return (
    <Card className="w-full max-w-[25rem] absolute top-1/2 right-0 -translate-y-1/2 shadow-lg bg-white rounded-sm">
      <CardHeader className="flex items-center justify-start">
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
            <FormInput
              name="phone"
              placeholder={i18n.get("pages.auth.register.phone.placeholder")}
              className="px-2 rounded-sm"
              formItemClassName="flex flex-col gap-1 h-[3.5rem]"
              type="tel"
            />
            <CardFooter className="flex-col gap-4 !p-0">
              <Button
                onClick={handleContinue}
                type="button"
                className={`w-full bg-red-primary !py-0.5 !rounded-sm text-white uppercase !px-0 ${
                  !isFormValid ? "cursor-not-allowed opacity-70" : ""
                }`}
              >
                {i18n.get("pages.auth.register.button-continue")}
              </Button>

              {isOpenDialog && (
                <DialogBox
                  open={isOpenDialog}
                  onOpenChange={setIsOpenDialog}
                  className="bg-white !rounded-sm !shadow-none"
                  footer={
                    <div className="flex items-center justify-center gap-4 py-4">
                      <Button className="bg-white border !rounded-none text-base text-grow-primary">
                        Hủy bỏ
                      </Button>
                      <Button
                        disabled={
                          !isFormValid || isPending || resendCountDown > 0
                        }
                        type="submit"
                        form="register-form"
                        className="bg-white border !rounded-none text-base text-grow-primary"
                      >
                        Gửi otp
                      </Button>
                    </div>
                  }
                >
                  <span className="flex items-center justify-center gap-1 font-medium text-grow-primary px-8">
                    Chúng tôi sẽ gửi mã xác minh qua Zalo đến{" "}
                    {form.getValues("phone")}
                  </span>
                </DialogBox>
              )}
              <div id="recaptcha-container" />
              {isPending && <Loading />}
              <span className="text-start w-full text-xs text-blue-primary cursor-pointer">
                {i18n.get("pages.auth.login.forgot-password.title")}
              </span>
              <div className="flex items-center w-full gap-4 justify-center">
                <div className="flex-1 bg-gray-primary w-full h-[1px]"></div>
                <span className="text-[12px] text-gray-500/40 uppercase font-medium">
                  {i18n.get("pages.auth.login.or.title")}
                </span>
                <div className="flex-1 bg-gray-primary w-full h-[1px]"></div>
              </div>
              <div className="flex items-center justify-center gap-2 w-full">
                <IconButton
                  type="button"
                  variant="outline"
                  className="w-full rounded-sm font-normal"
                  startIcon={<FaFacebook color="#1877F2" size={22} />}
                >
                  {i18n.get("pages.auth.with.facebook.title")}
                </IconButton>
                <IconButton
                  type="button"
                  className="w-full rounded-sm font-normal"
                  variant="outline"
                  startIcon={<FcGoogle size={22} />}
                >
                  {i18n.get("pages.auth.with.google.title")}
                </IconButton>
              </div>
              <div className="flex items-center justify-center gap-1 text-sm">
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
