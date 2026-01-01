"use client";
import { Button } from "@/src/components/ui/button";
import {
  Card,
  CardAction,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/src/components/ui/card";
import { Form } from "@/src/components/ui/form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import z from "zod";
import { loginSchema } from "../types";
import i18n from "@/src/lib/locale";
import { FormInput } from "@/src/components/shared/FormInput";
import { useState } from "react";
import { IconButton } from "@/src/components/shared/IconButton";
import {
  FaFacebook,
  FcGoogle,
  ImQrcode,
  LuEye,
  LuEyeClosed,
} from "@/src/components/shared/Icon";
import { useNavigate } from "@/src/common/constants/navigate.constant";
import { useLoginMutation } from "../api/auth.api";
import { toast } from "sonner";

const LoginCard = () => {
  const [login, { isLoading, error }] = useLoginMutation();
  const [isShowPassword, setIsShowPassword] = useState(false);
  const { push } = useNavigate();
  const form = useForm<z.infer<typeof loginSchema>>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      username: "",
      password: "",
    },
  });
  const isFormValid = form.formState.isValid;
  // 2. Define a submit handler.
  async function onSubmit(values: z.infer<typeof loginSchema>) {
    try {
      toast.promise(
        login({
          identifier: values.username,
          password: values.password,
        }).unwrap(),
        {
          loading: i18n.get("pages.auth.login.loading.title"),
          success: () => {
            push("/");
            return i18n.get("pages.auth.login.success.title");
          },
          error: () => {
            return i18n.get(
              "pages.auth.login.fail.wrong-username-password.title"
            );
          },
        }
      );
    } catch (err) {
      console.log(err);
    }
  }
  return (
    <Card className="w-full max-w-[25rem] absolute top-1/2 right-0 -translate-y-1/2 shadow-lg bg-white rounded-sm">
      <CardHeader className="flex items-center justify-center">
        <CardTitle className="text-xl font-medium">
          {i18n.get("pages.auth.login.title")}
        </CardTitle>
        <CardAction className="flex items-center">
          <div
            className="relative border-2 py-[11px] px-[14px] mr-[1rem] after:box-border
          border-yellow-primary after:absolute after:content-[''] 
          after:w-[.75rem] after:h-[.75rem] after:border-r-2
          after:border-yellow-primary after:rotate-45 after:-translate-y-1/2 after:transform
          after:-translate-x-1/2 after:top-1/2 after:border-t-2 after:right-[-.85rem] 
          after:bg-foreground-primary bg-foreground-primary"
          >
            <span className="text-[14px] text-yellow-primary font-bold">
              {i18n.get("pages.auth.login.with.qrcode.title")}
            </span>
          </div>
          <ImQrcode
            size={40}
            className="text-red-primary"
            onClick={() => push("login/qr")}
          />
        </CardAction>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="flex flex-col gap-3"
          >
            <FormInput
              name="username"
              placeholder={i18n.get("pages.auth.login.username.placeholder")}
              className="px-2 rounded-sm"
              formItemClassName="flex flex-col gap-1 h-[3.5rem]"
            />
            <FormInput
              name="password"
              placeholder={i18n.get("pages.auth.login.password.placeholder")}
              type={isShowPassword ? "text" : "password"}
              endIcon={
                isShowPassword ? (
                  <LuEye
                    className="cursor-pointer text-muted-foreground"
                    onClick={() => setIsShowPassword(!isShowPassword)}
                  />
                ) : (
                  <LuEyeClosed
                    className="cursor-pointer text-muted-foreground stroke-[1]"
                    onClick={() => setIsShowPassword(!isShowPassword)}
                  />
                )
              }
              className="px-2 rounded-sm"
              formItemClassName="flex flex-col gap-1 h-[3.5rem]"
            />

            <CardFooter className="flex-col gap-4 !p-0">
              <IconButton
                busy={isLoading}
                type={!isFormValid ? "button" : "submit"}
                className={`w-full bg-red-primary !py-0.5 !rounded-sm text-white uppercase !px-0 ${
                  !isFormValid ? "cursor-not-allowed opacity-70" : ""
                }`}
              >
                {i18n.get("pages.auth.login.button-login")}
              </IconButton>
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
                  {i18n.get("pages.auth.description.register.title")}
                </span>
                <span
                  className="text-red-primary cursor-pointer"
                  onClick={() => push("/buyer/signup")}
                >
                  {i18n.get("pages.auth.register.title")}
                </span>
              </div>
            </CardFooter>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
};

export default LoginCard;
