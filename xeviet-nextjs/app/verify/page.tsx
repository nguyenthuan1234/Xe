"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  Mail,
  CheckCircle,
  RefreshCcw,
  ArrowLeft,
  AlertCircle,
} from "lucide-react";
import { Btn } from "@/components/ui";
import { useAuth, PENDING_REGISTRATION_KEY } from "@/lib/auth";
import { ApiError } from "@/lib/api";

export default function VerifyPage() {
  const router = useRouter();
  const { verifyOtp, resendOtp } = useAuth();
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [countdown, setCountdown] = useState(60);
  const [pendingEmail, setPendingEmail] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    try {
      const raw = sessionStorage.getItem(PENDING_REGISTRATION_KEY);
      if (raw) {
        const data = JSON.parse(raw);
        if (data?.email) setPendingEmail(data.email);
      } else {
        router.replace("/register");
      }
    } catch {
      router.replace("/register");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (countdown > 0) {
      const t = setTimeout(() => setCountdown((c) => c - 1), 1000);
      return () => clearTimeout(t);
    }
  }, [countdown]);

  const handleInput = (val: string, idx: number) => {
    const next = [...otp];
    next[idx] = val.replace(/\D/, "").slice(-1);
    setOtp(next);
    if (val && idx < 5) document.getElementById(`otp-${idx + 1}`)?.focus();
  };

  const handleKeyDown = (
    e: React.KeyboardEvent<HTMLInputElement>,
    idx: number,
  ) => {
    if (e.key === "Backspace" && !otp[idx] && idx > 0) {
      document.getElementById(`otp-${idx - 1}`)?.focus();
    }
  };

  const handleConfirm = async () => {
    const code = otp.join("");
    if (code.length !== 6) {
      setError("Vui lòng nhập đủ 6 số của mã OTP.");
      return;
    }
    setError("");
    setSubmitting(true);
    try {
      const user = await verifyOtp(pendingEmail, code);
      try {
        sessionStorage.removeItem(PENDING_REGISTRATION_KEY);
      } catch {
        // bỏ qua
      }
      router.push(user.role === "admin" ? "/admin" : "/");
    } catch (err) {
      setError(
        err instanceof ApiError ? err.message : "Xác thực OTP thất bại.",
      );
    } finally {
      setSubmitting(false);
    }
  };

  const handleResend = async () => {
    setError("");
    try {
      await resendOtp(pendingEmail);
      setCountdown(60);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Gửi lại OTP thất bại.");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-16 bg-gradient-to-br from-blue-50 via-white to-blue-50">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white rounded-3xl shadow-2xl shadow-blue-900/10 border border-slate-100 p-8 w-full max-w-md text-center"
      >
        <div className="bg-blue-50 rounded-2xl flex items-center justify-center mx-auto mb-4 w-[72px] h-[72px]">
          <Mail size={32} className="text-blue-600" />
        </div>
        <h2 className="text-2xl font-black text-slate-900 mb-2">
          Xác nhận tài khoản
        </h2>
        <p className="text-slate-500 text-sm mb-1">
          Mã OTP đã được gửi đến email
        </p>
        <p className="text-blue-600 font-bold text-sm mb-2">{pendingEmail}</p>

        <p className="text-xs text-slate-400 mb-8">
          Vui lòng kiểm tra hộp thư (kể cả mục Spam) để lấy mã.
        </p>

        <div className="flex gap-2 justify-center mb-6">
          {otp.map((digit, i) => (
            <input
              key={i}
              id={`otp-${i}`}
              type="text"
              inputMode="numeric"
              value={digit}
              onChange={(e) => handleInput(e.target.value, i)}
              onKeyDown={(e) => handleKeyDown(e, i)}
              className="w-12 h-14 text-center text-xl font-black border-2 rounded-xl outline-none transition-all focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 border-slate-200 bg-slate-50"
              maxLength={1}
            />
          ))}
        </div>

        {error && (
          <p className="flex items-center justify-center gap-1.5 text-xs text-red-600 font-medium mb-4">
            <AlertCircle size={13} /> {error}
          </p>
        )}

        <Btn
          size="lg"
          className="w-full mb-4"
          onClick={handleConfirm}
          disabled={submitting}
        >
          <CheckCircle size={17} />{" "}
          {submitting ? "Đang xác nhận..." : "Xác nhận"}
        </Btn>

        <div className="text-sm text-slate-500">
          {countdown > 0 ? (
            <span>
              Gửi lại mã sau{" "}
              <span className="text-blue-600 font-black tabular-nums">
                {countdown}s
              </span>
            </span>
          ) : (
            <button
              onClick={handleResend}
              className="text-blue-600 font-bold hover:underline flex items-center gap-1.5 mx-auto"
            >
              <RefreshCcw size={13} /> Gửi lại mã OTP
            </button>
          )}
        </div>

        <button
          onClick={() => router.push("/register")}
          className="text-xs text-slate-400 hover:text-slate-600 mt-5 flex items-center gap-1 mx-auto transition-colors"
        >
          <ArrowLeft size={13} /> Quay lại
        </button>
      </motion.div>
    </div>
  );
}
