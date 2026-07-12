"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { User, Mail, Phone, Lock, AlertCircle } from "lucide-react";
import AuthLayout from "@/components/AuthLayout";
import { Field, Btn } from "@/components/ui";
import { PENDING_REGISTRATION_KEY, useAuth } from "@/lib/auth";
import { ApiError } from "@/lib/api";

export default function RegisterPage() {
  const router = useRouter();
  const { register } = useAuth();
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [agree, setAgree] = useState(false);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!fullName || !email || !phone || !password || !confirmPassword) {
      setError("Vui lòng điền đầy đủ thông tin bắt buộc.");
      return;
    }
    if (password !== confirmPassword) {
      setError("Mật khẩu xác nhận không khớp.");
      return;
    }
    if (!agree) {
      setError("Vui lòng đồng ý với Điều khoản sử dụng và Chính sách bảo mật.");
      return;
    }
    setError("");
    setSubmitting(true);
    try {
      const res = await register({ name: fullName, email, phone, password });
      // Lưu email (+ devOtp nếu backend đang ở chế độ dev) để trang xác thực OTP dùng
      try {
        sessionStorage.setItem(PENDING_REGISTRATION_KEY, JSON.stringify({ email: res.email, devOtp: res.devOtp }));
      } catch {
        // sessionStorage không khả dụng — vẫn tiếp tục
      }
      router.push("/verify");
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Đăng ký thất bại. Vui lòng thử lại.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AuthLayout>
      <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="w-full max-w-md">
        <div className="mb-8">
          <h2 className="text-2xl font-black text-slate-900">Tạo tài khoản</h2>
          <p className="text-slate-500 text-sm mt-1">Tham gia cộng đồng mua bán xe</p>
        </div>

        <div className="space-y-4">
          <Field label="Họ và tên *" placeholder="Nguyễn Văn An" icon={<User size={15} />} value={fullName} onChange={(e) => setFullName(e.target.value)} />
          <Field label="Email *" placeholder="email@example.com" type="email" icon={<Mail size={15} />} value={email} onChange={(e) => setEmail(e.target.value)} />
          <Field label="Số điện thoại *" placeholder="0912 345 678" type="tel" icon={<Phone size={15} />} value={phone} onChange={(e) => setPhone(e.target.value)} />
          <Field label="Mật khẩu *" placeholder="Tối thiểu 8 ký tự" type="password" icon={<Lock size={15} />} value={password} onChange={(e) => setPassword(e.target.value)} />
          <Field
            label="Xác nhận mật khẩu *"
            placeholder="Nhập lại mật khẩu"
            type="password"
            icon={<Lock size={15} />}
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
          />

          <div className="flex items-start gap-2.5 py-1">
            <input
              type="checkbox"
              checked={agree}
              onChange={(e) => setAgree(e.target.checked)}
              className="mt-0.5 w-4 h-4 accent-blue-600 rounded flex-shrink-0"
            />
            <p className="text-xs text-slate-600 leading-relaxed">
              Tôi đồng ý với <span className="text-blue-600 font-semibold cursor-pointer">Điều khoản sử dụng</span> và{" "}
              <span className="text-blue-600 font-semibold cursor-pointer">Chính sách bảo mật</span> của XeViệt
            </p>
          </div>

          {error && (
            <p className="flex items-center gap-1.5 text-xs text-red-600 font-medium">
              <AlertCircle size={13} /> {error}
            </p>
          )}

          <Btn size="lg" className="w-full" onClick={handleSubmit} disabled={submitting}>
            {submitting ? "Đang đăng ký..." : "Đăng ký"}
          </Btn>
        </div>

        <p className="text-center text-sm text-slate-500 mt-6">
          Đã có tài khoản?{" "}
          <Link href="/login" className="text-blue-600 font-black hover:underline">
            Đăng nhập
          </Link>
        </p>
      </motion.div>
    </AuthLayout>
  );
}
