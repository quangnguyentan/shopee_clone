"use client";

import {
  Card,
  CardAction,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/src/components/ui/card";
import i18n from "@/src/lib/locale";
import Image from "next/image";
import { useEffect, useState } from "react";
import {
  IoReload,
  SiShopee,
  TbPasswordUser,
} from "@/src/components/shared/Icon";
import { IconButton } from "@/src/components/shared/IconButton";
import expires_qr from "@/src/assest/expires-qr.png";
import { useNavigate } from "@/src/common/constants/navigate.constant";
const QRCard = () => {
  const [qr, setQr] = useState<string | null>(null);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [status, setStatus] = useState<"PENDING" | "VERIFIED" | "EXPIRED">(
    "PENDING"
  );
  const { back } = useNavigate();
  const fetchQR = async () => {
    await fetch("http://localhost:8080/auth/qr")
      .then((res) => res.json())
      .then((data) => {
        setQr(data.qr);
        setSessionId(data.sessionId);
      });
  };
  useEffect(() => {
    fetchQR();
  }, []);

  useEffect(() => {
    if (!sessionId) return;

    const timer = setInterval(async () => {
      const res = await fetch(
        `http://localhost:8080/auth/qr/status/${sessionId}`
      );
      const data = await res.json();

      setStatus(data.status);

      if (data.status === "VERIFIED") {
        clearInterval(timer);
        console.log("LOGIN SUCCESS", data);
      }
    }, 2000);

    return () => clearInterval(timer);
  }, [sessionId]);

  const renderQRCode = () => {
    if (status === "EXPIRED" && qr) {
      return (
        <>
          <Image src={expires_qr} alt="QR Code" width={220} height={220} />
          <IconButton
            variant="outline"
            className="border-red-primary rounded-sm absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white"
            startIcon={<IoReload className="text-red-primary" />}
            onClick={fetchQR}
          >
            <span className="text-red-primary">
              {i18n.get("pages.auth.login.qr.load-qr.title")}
            </span>
          </IconButton>
        </>
      );
    } else if (qr) {
      return <Image src={qr} alt="QR Code" width={220} height={220} />;
    } else {
      return <SiShopee size={80} opacity={0.7} />;
    }
  };

  return (
    <Card className="w-full max-w-[25rem] absolute top-1/2 right-0 -translate-y-1/2 shadow-lg bg-white rounded-sm">
      <CardHeader className="flex items-center justify-center">
        <CardTitle className="text-xl font-medium">
          {i18n.get("pages.auth.login.with.qrcode.title")}
        </CardTitle>
        <CardAction className="flex items-center ">
          <div
            className="relative border-2 py-[11px] px-[14px] mr-[1rem] after:box-border
          border-yellow-primary after:absolute after:content-[''] 
          after:w-[.75rem] after:h-[.75rem] after:border-r-2
          after:border-yellow-primary after:rotate-45 after:-translate-y-1/2 after:transform
          after:-translate-x-1/2 after:top-1/2 after:border-t-2 after:right-[-.85rem] 
          after:bg-foreground-primary bg-foreground-primary"
          >
            <span className="text-[14px] text-yellow-primary font-bold">
              {i18n.get("pages.auth.login.with.password.title")}
            </span>
          </div>
          <TbPasswordUser
            size={40}
            className="text-red-primary cursor-pointer"
            onClick={() => back()}
          />
        </CardAction>
      </CardHeader>
      <CardContent className="flex flex-col items-center justify-center">
        <div className="w-[220px] h-[220px] relative flex items-center justify-center">
          {renderQRCode()}
        </div>
        {status === "EXPIRED" && (
          <span className="text-xl text-red-primary">
            {i18n.get("pages.auth.login.qr.expires.title")}
          </span>
        )}
      </CardContent>
      <CardFooter className="flex flex-col items-center justify-center gap-4">
        <span className="text-blue-primary cursor-pointer">
          {i18n.get("pages.auth.login.description.qr.title")}
        </span>
        <div className="flex items-center justify-center gap-1 text-sm">
          <span className="text-gray-secondary">
            {i18n.get("pages.auth.description.register.title")}
          </span>
          <span className="text-red-primary cursor-pointer ">
            {i18n.get("pages.auth.register.title")}
          </span>
        </div>
      </CardFooter>
    </Card>
  );
};

export default QRCard;
