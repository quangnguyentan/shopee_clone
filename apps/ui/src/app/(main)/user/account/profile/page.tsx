"use client";

import Image from "next/image";
import Link from "next/link";
import axios from "axios";
import {
  useEffect,
  useRef,
  useState,
  type ChangeEvent,
  type FormEvent,
} from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  useGetMeQuery,
  useUpdateMyProfileMutation,
} from "@/src/common/api/user.api";
import { useAppSelector } from "@/src/common/hooks/useAppSelector";
import { getAssetUrl } from "@/src/lib/assets";
import { getEnv } from "@/src/common/config/env.client";

type ProfileGender = "male" | "female" | "other" | "";

const getApiError = (error: unknown) => {
  if (!error || typeof error !== "object") {
    return "Vui lòng thử lại.";
  }
  const { data, response } = error as {
    data?: { message?: string | string[] };
    response?: { data?: { message?: string | string[] } };
  };
  const message = data?.message ?? response?.data?.message;
  return Array.isArray(message) ? message.join(", ") : message || "Vui lòng thử lại.";
};

const ProfilePage = () => {
  const router = useRouter();
  const isAuthenticated = useAppSelector(
    (state) => state.auth.isAuthenticated,
  );
  const {
    data: user,
    isLoading,
    isError,
  } = useGetMeQuery(undefined, { skip: !isAuthenticated });
  const [updateMyProfile, { isLoading: isSaving }] =
    useUpdateMyProfileMutation();
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [gender, setGender] = useState<ProfileGender>("");
  const [dateOfBirth, setDateOfBirth] = useState("");
  const [avatar, setAvatar] = useState("");
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);
  const initializedUserId = useRef<string | null>(null);

  useEffect(() => {
    if (user && initializedUserId.current !== user.id) {
      initializedUserId.current = user.id;
      setName(user.name ?? "");
      setPhone(user.phone ?? "");
      setGender(user.gender ?? "");
      setDateOfBirth(user.date_of_birth ?? "");
      setAvatar(user.avatar ?? "");
    }
  }, [user]);

  const saveProfile = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    try {
      await updateMyProfile({
        name: name.trim(),
        phone: phone.trim(),
        gender: gender || null,
        date_of_birth: dateOfBirth || null,
      }).unwrap();
      toast.success("Đã cập nhật hồ sơ.");
    } catch (error) {
      toast.error(`Không thể cập nhật hồ sơ. ${getApiError(error)}`);
    }
  };

  const uploadAvatar = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;
    if (!["image/jpeg", "image/png"].includes(file.type)) {
      toast.error("Ảnh đại diện chỉ hỗ trợ định dạng JPG hoặc PNG.");
      return;
    }
    if (file.size > 1024 * 1024) {
      toast.error("Dung lượng ảnh tối đa là 1 MB.");
      return;
    }

    setIsUploadingAvatar(true);
    try {
      const formData = new FormData();
      formData.append("files", file);
      const assetBaseUrl = getEnv().NEXT_PUBLIC_ASSETS_URL.replace(/\/+$/, "");
      const { data } = await axios.post<{ url: string }>(
        `${assetBaseUrl}/assets/upload?type=avatars`,
        formData,
      );
      if (!data.url) throw new Error("Dịch vụ ảnh không trả về đường dẫn ảnh.");
      await updateMyProfile({ avatar: data.url }).unwrap();
      setAvatar(data.url);
      toast.success("Đã cập nhật ảnh đại diện.");
    } catch (error) {
      const apiMessage = getApiError(error);
      const message =
        apiMessage === "Vui lòng thử lại." && error instanceof Error
          ? error.message
          : apiMessage;
      toast.error(`Không thể tải ảnh đại diện. ${message}`);
    } finally {
      setIsUploadingAvatar(false);
    }
  };

  if (!isAuthenticated) {
    return (
      <section className="bg-white p-10 text-center">
        <p className="text-gray-700">Đăng nhập để quản lý hồ sơ của bạn.</p>
        <button
          type="button"
          onClick={() =>
            router.push(
              `/buyer/login?redirect=${encodeURIComponent("/user/account/profile")}`,
            )
          }
          className="mt-4 rounded-sm bg-red-primary px-6 py-2 text-sm text-white"
        >
          Đăng nhập
        </button>
      </section>
    );
  }

  return (
    <div className="mx-auto grid max-w-screen-xl gap-5 py-5 lg:grid-cols-[220px_minmax(0,1fr)]">
      <aside className="space-y-4">
        <div className="flex items-center gap-3 border-b border-gray-200 pb-4">
          <div className="relative h-12 w-12 overflow-hidden rounded-full bg-gray-200">
            {user?.avatar && (
              <Image
                src={getAssetUrl(user.avatar) ?? user.avatar}
                alt=""
                fill
                unoptimized
                sizes="48px"
                className="object-cover"
              />
            )}
            {!user?.avatar && (
              <span className="flex h-full items-center justify-center text-xl text-gray-500">
                {user?.name?.slice(0, 1).toUpperCase() ?? "?"}
              </span>
            )}
          </div>
          <div className="min-w-0">
            <p className="truncate text-sm font-medium text-gray-800">
              {user?.name || "Tài khoản của tôi"}
            </p>
            <Link
              href="/user/account/profile"
              className="text-xs text-gray-500 hover:text-red-primary"
            >
              Sửa hồ sơ
            </Link>
          </div>
        </div>
        <nav aria-label="Tài khoản" className="space-y-2 text-sm">
          <p className="px-2 py-1 font-medium text-gray-800">
            Tài khoản của tôi
          </p>
          <Link
            href="/user/account/profile"
            aria-current="page"
            className="block rounded-sm bg-red-50 px-3 py-2 text-red-primary"
          >
            Hồ sơ
          </Link>
          <Link
            href="/user/purchase"
            className="block rounded-sm px-3 py-2 text-gray-600 hover:bg-white"
          >
            Đơn mua
          </Link>
          <Link
            href="/cart"
            className="block rounded-sm px-3 py-2 text-gray-600 hover:bg-white"
          >
            Giỏ hàng
          </Link>
        </nav>
      </aside>

      <section className="min-h-[460px] bg-white p-5 sm:p-8">
        <header className="border-b border-gray-200 pb-5">
          <h1 className="text-lg font-medium text-gray-800">Hồ sơ của tôi</h1>
          <p className="mt-1 text-sm text-gray-500">
            Quản lý thông tin hồ sơ để bảo mật tài khoản
          </p>
        </header>

        {isLoading ? (
          <div className="mt-8 h-48 animate-pulse bg-gray-100" />
        ) : isError || !user ? (
          <p role="alert" className="mt-8 text-sm text-red-primary">
            Không thể tải hồ sơ. Vui lòng thử lại.
          </p>
        ) : (
          <form
            onSubmit={saveProfile}
            className="grid gap-8 pt-7 md:grid-cols-[minmax(0,1fr)_230px]"
          >
            <div className="space-y-5">
              <label className="grid gap-2 sm:grid-cols-[140px_minmax(0,1fr)] sm:items-center">
                <span className="text-right text-sm text-gray-500">
                  Email
                </span>
                <input
                  type="email"
                  value={user.email ?? ""}
                  disabled
                  className="w-full rounded-sm border border-gray-200 bg-gray-50 px-3 py-2 text-sm text-gray-500"
                />
              </label>
              <label className="grid gap-2 sm:grid-cols-[140px_minmax(0,1fr)] sm:items-center">
                <span className="text-right text-sm text-gray-500">Tên</span>
                <input
                  required
                  minLength={2}
                  maxLength={100}
                  value={name}
                  onChange={(event) => setName(event.target.value)}
                  className="w-full rounded-sm border border-gray-300 px-3 py-2 text-sm text-gray-800 outline-none focus:border-red-primary"
                />
              </label>
              <label className="grid gap-2 sm:grid-cols-[140px_minmax(0,1fr)] sm:items-center">
                <span className="text-right text-sm text-gray-500">
                  Số điện thoại
                </span>
                <input
                  type="tel"
                  pattern="0[0-9]{9}"
                  title="Nhập số điện thoại Việt Nam gồm 10 chữ số, bắt đầu bằng 0"
                  value={phone}
                  onChange={(event) => setPhone(event.target.value)}
                  placeholder="Chưa cập nhật"
                  className="w-full rounded-sm border border-gray-300 px-3 py-2 text-sm text-gray-800 outline-none focus:border-red-primary"
                />
              </label>
              <label className="grid gap-2 sm:grid-cols-[140px_minmax(0,1fr)] sm:items-center">
                <span className="text-right text-sm text-gray-500">
                  Giới tính
                </span>
                <select
                  value={gender}
                  onChange={(event) => {
                    const value = event.target.value;
                    if (
                      value === "male" ||
                      value === "female" ||
                      value === "other"
                    ) {
                      setGender(value);
                    } else {
                      setGender("");
                    }
                  }}
                  className="w-full rounded-sm border border-gray-300 bg-white px-3 py-2 text-sm text-gray-800 outline-none focus:border-red-primary"
                >
                  <option value="">Chọn giới tính</option>
                  <option value="male">Nam</option>
                  <option value="female">Nữ</option>
                  <option value="other">Khác</option>
                </select>
              </label>
              <label className="grid gap-2 sm:grid-cols-[140px_minmax(0,1fr)] sm:items-center">
                <span className="text-right text-sm text-gray-500">
                  Ngày sinh
                </span>
                <input
                  type="date"
                  value={dateOfBirth}
                  max={new Date().toISOString().slice(0, 10)}
                  onChange={(event) => setDateOfBirth(event.target.value)}
                  className="w-full rounded-sm border border-gray-300 px-3 py-2 text-sm text-gray-800 outline-none focus:border-red-primary"
                />
              </label>
              <div className="grid gap-2 sm:grid-cols-[140px_minmax(0,1fr)] sm:items-center">
                <span className="text-right text-sm text-gray-500">
                  Ngày tham gia
                </span>
                <span className="text-sm text-gray-700">
                  {user.created_at
                    ? new Intl.DateTimeFormat("vi-VN", {
                        dateStyle: "long",
                      }).format(new Date(user.created_at))
                    : "—"}
                </span>
              </div>
              <div className="sm:pl-[140px]">
                <button
                  type="submit"
                  disabled={isSaving || isUploadingAvatar}
                  className="rounded-sm bg-red-primary px-8 py-2.5 text-sm text-white disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {isSaving ? "Đang lưu..." : "Lưu"}
                </button>
              </div>
            </div>

            <div className="flex flex-col items-center justify-center border-t border-gray-200 pt-6 md:border-l md:border-t-0 md:pt-0">
              <div className="relative flex h-28 w-28 items-center justify-center overflow-hidden rounded-full bg-gray-100 text-5xl text-gray-300">
                {avatar ? (
                  <Image
                    src={getAssetUrl(avatar) ?? avatar}
                    alt="Ảnh đại diện"
                    fill
                    unoptimized
                    sizes="112px"
                    className="object-cover"
                  />
                ) : (
                  user.name?.slice(0, 1).toUpperCase() ?? "?"
                )}
              </div>
              <label className="mt-4 cursor-pointer rounded-sm border border-gray-300 px-5 py-2 text-sm text-gray-700 hover:border-red-primary hover:text-red-primary">
                {isUploadingAvatar ? "Đang tải ảnh..." : "Chọn ảnh"}
                <input
                  type="file"
                  accept="image/jpeg,image/png"
                  disabled={isUploadingAvatar}
                  onChange={uploadAvatar}
                  className="sr-only"
                />
              </label>
              <p className="mt-4 text-center text-xs leading-5 text-gray-400">
                Dung lượng tối đa 1 MB. Định dạng JPG, PNG.
              </p>
            </div>
          </form>
        )}
      </section>
    </div>
  );
};

export default ProfilePage;
