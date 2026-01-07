"use client";
import React, { useState } from "react";
import {
  useSetup2FAMutation,
  useVerify2FAMutation,
} from "../../../common/api/auth.api";

export default function Setup2FAForm({ userId }: { userId: number }) {
  const [setup2FA] = useSetup2FAMutation();
  const [verify2FA] = useVerify2FAMutation();
  const [qr, setQr] = useState<string | null>(null);
  const [token, setToken] = useState("");

  const handleSetup = async () => {
    try {
      const res = await setup2FA({ userId }).unwrap();
      console.log(res, "res");
      setQr(res.qr);
    } catch (err) {
      console.error(err);
    }
  };

  const handleVerify = async () => {
    try {
      const res = await verify2FA({ userId, token }).unwrap();

      alert("2FA setup success!");
    } catch (err) {
      alert("Invalid OTP");
    }
  };

  return (
    <div>
      <button onClick={handleSetup}>Setup 2FA</button>

      {qr && (
        <div>
          <img src={qr} alt="QR Code" />
          <input
            value={token}
            onChange={(e) => setToken(e.target.value)}
            placeholder="Enter OTP code"
          />
          <button onClick={handleVerify}>Verify 2FA</button>
        </div>
      )}
    </div>
  );
}
