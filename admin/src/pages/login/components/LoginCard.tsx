/* eslint-disable @typescript-eslint/no-unused-expressions */
"use client";

import { Card, Input, Button, Typography, Divider } from "antd";
import {
  EyeInvisibleOutlined,
  EyeTwoTone,
  LockOutlined,
  UserOutlined,
  GithubOutlined,
  GoogleOutlined,
} from "@ant-design/icons";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import z from "zod";
import { toast } from "sonner";

import { useLoginMutation } from "@/common/api/auth.api";
import { useAppDispatch } from "@/common/hooks/useAppSelector";
import { loginSuccess } from "@/common/storage/auth.slice";
import { setMe } from "@/common/storage/user.slice";
import { socket } from "@/common/config/socket";
import { AUTH_ERROR } from "@/common/constants/errors";
import { getErrorMessage } from "@/common/helper/handleErrorToast";
import { useNavigate } from "react-router-dom";

const { Title, Text, Link } = Typography;

/* ---------------- schema ---------------- */
const loginSchema = z.object({
  username: z.string().min(1, "Vui lòng nhập email"),
  password: z.string().min(1, "Vui lòng nhập mật khẩu"),
});

type LoginForm = z.infer<typeof loginSchema>;

export default function LoginCard() {
  const dispatch = useAppDispatch();
  const [login, { isLoading }] = useLoginMutation();
  const navigate = useNavigate();
  const {
    control,
    handleSubmit,
    formState: { isValid },
  } = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
    mode: "onChange",
  });

  const onSubmit = (values: LoginForm) => {
    toast.promise(
      login({
        identifier: values.username,
        password: values.password,
      }).unwrap(),
      {
        loading: "Signing in...",
        success: (res) => {
          dispatch(loginSuccess());
          dispatch(setMe({ user: res.user, sessionId: res.sessionId }));

          if (!socket.connected) {
            socket.connect();
            socket.once("connect", () => {
              res.sessionId && socket.emit("register_session", res.sessionId);
            });
          } else {
            res.sessionId && socket.emit("register_session", res.sessionId);
          }
          navigate("/", { replace: true });
          return "Login successful";
        },
        error: (err) =>
          getErrorMessage(err, {
            [AUTH_ERROR.USER_NOT_FOUND]: "Admin account not found",
            [AUTH_ERROR.INVALID_PASSWORD]: "Invalid password",
          }),
      }
    );
  };

  return (
    <Card bordered={false} className="w-full max-w-[420px] shadow-none">
      {/* LOGO */}
      <div className="mb-6">
        <div className="w-10 h-10 rounded-xl bg-black flex items-center justify-center text-white font-bold">
          A
        </div>
      </div>

      {/* HEADER */}
      <Title level={2} className="!mb-1">
        Welcome back!
      </Title>
      <Text type="secondary">Please enter your credentials to sign in!</Text>

      {/* FORM */}
      <form onSubmit={handleSubmit(onSubmit)} className="mt-8 space-y-4">
        {/* EMAIL */}
        <Controller
          name="username"
          control={control}
          render={({ field, fieldState }) => (
            <div>
              <label className="text-sm font-medium">Email</label>
              <Input
                {...field}
                size="large"
                prefix={<UserOutlined />}
                placeholder="admin-01@acme.com"
                status={fieldState.error ? "error" : ""}
                className="mt-1"
              />
              {fieldState.error && (
                <Text type="danger" className="text-xs">
                  {fieldState.error.message}
                </Text>
              )}
            </div>
          )}
        />

        {/* PASSWORD */}
        <Controller
          name="password"
          control={control}
          render={({ field, fieldState }) => (
            <div>
              <label className="text-sm font-medium">Password</label>
              <Input.Password
                {...field}
                size="large"
                prefix={<LockOutlined />}
                placeholder="••••••••"
                iconRender={(v) =>
                  v ? <EyeTwoTone /> : <EyeInvisibleOutlined />
                }
                status={fieldState.error ? "error" : ""}
                className="mt-1"
              />
              <div className="flex justify-between mt-1">
                {fieldState.error ? (
                  <Text type="danger" className="text-xs">
                    {fieldState.error.message}
                  </Text>
                ) : (
                  <span />
                )}
                <Link className="text-xs">Forgot password</Link>
              </div>
            </div>
          )}
        />

        {/* BUTTON */}
        <Button
          htmlType="submit"
          block
          size="large"
          loading={isLoading}
          disabled={!isValid}
          className="!h-11 !bg-blue-600 hover:!bg-blue-700 !text-white"
          type="primary"
        >
          Sign In
        </Button>
      </form>

      <Divider className="!my-6">or continue with</Divider>

      {/* SOCIAL */}
      <div className="grid grid-cols-2 gap-3">
        <Button size="large" icon={<GoogleOutlined />}>
          Google
        </Button>
        <Button size="large" icon={<GithubOutlined />}>
          Github
        </Button>
      </div>

      <Text type="secondary" className="block text-center text-xs mt-6 ">
        Don&apos;t have an account? <Link>Sign up</Link>
      </Text>
    </Card>
  );
}
