"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Mail, Lock, AlertCircle } from "lucide-react";
import AuthLayout from "@/components/AuthLayout";
import { Field, Btn } from "@/components/ui";
import { useAuth } from "@/lib/auth";
import { ApiError } from "@/lib/api";

export default function LoginPage() {
  const router = useRouter();
  const { login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!email || !password) {
      setError("Vui lòng nhập email và mật khẩu.");
      return;
    }
    setError("");
    setSubmitting(true);
    try {
      const user = await login(email, password);
      // role lấy từ backend thật — không còn đoán qua email
      router.push(user.role === "admin" ? "/admin" : "/");
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Đăng nhập thất bại.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AuthLayout>
      <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="w-full max-w-md">
        <div className="mb-8">
          <h2 className="text-2xl font-black text-slate-900">Đăng nhập</h2>
          <p className="text-slate-500 text-sm mt-1">Chào mừng bạn quay trở lại!</p>
        </div>

        <div className="space-y-4">
          <Field
            label="Email"
            placeholder="email@example.com"
            type="email"
            icon={<Mail size={15} />}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <Field
            label="Mật khẩu"
            placeholder="Nhập mật khẩu"
            type="password"
            icon={<Lock size={15} />}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />

          {error && (
            <p className="flex items-center gap-1.5 text-xs text-red-600 font-medium">
              <AlertCircle size={13} /> {error}
            </p>
          )}

          <div className="flex items-center justify-between">
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" className="w-4 h-4 accent-blue-600 rounded" />
              <span className="text-sm text-slate-600">Ghi nhớ đăng nhập</span>
            </label>
            <button className="text-sm text-blue-600 font-bold hover:underline">Quên mật khẩu?</button>
          </div>
          <Btn size="lg" className="w-full" onClick={handleSubmit} disabled={submitting}>
            {submitting ? "Đang đăng nhập..." : "Đăng nhập"}
          </Btn>

          <div className="relative my-4">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-200" />
            </div>
            <div className="relative text-center">
              <span className="bg-white px-4 text-xs text-slate-400">Hoặc tiếp tục với</span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            {[
              ["Google", "🔵"],
              ["Facebook", "📘"],
            ].map(([label, icon]) => (
              <button
                key={label}
                className="flex items-center justify-center gap-2 py-2.5 rounded-xl border border-slate-200 text-sm font-semibold text-slate-700 hover:bg-slate-50 transition-colors"
              >
                <span>{icon}</span> {label}
              </button>
            ))}
          </div>

          <p className="text-[11px] text-slate-400 text-center leading-relaxed pt-2">
            Chưa có tài khoản admin? Tài khoản mẫu sau khi chạy <code className="bg-slate-100 px-1 rounded">npm run seed</code> ở backend:{" "}
            <span className="font-semibold text-slate-500">admin@xeviet.vn / Admin@123</span>
          </p>
        </div>

        <p className="text-center text-sm text-slate-500 mt-8">
          Chưa có tài khoản?{" "}
          <Link href="/register" className="text-blue-600 font-black hover:underline">
            Đăng ký ngay
          </Link>
        </p>
      </motion.div>
    </AuthLayout>
  );
}
