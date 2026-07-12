"use client";

import type { ReactNode } from "react";
import Image from "next/image";

export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen flex">
      {/* Left panel — giống nhau cho cả Login & Register để đồng bộ */}
      <div className="hidden lg:flex flex-1 relative overflow-hidden">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="https://images.unsplash.com/photo-1583121274602-3e2820c69888?w=900&h=1200&fit=crop&auto=format"
          alt=""
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-br from-blue-900/80 to-slate-900/60" />
        <div className="absolute inset-0 flex flex-col justify-end p-12">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-10 h-10 rounded-xl overflow-hidden relative flex-shrink-0 bg-white">
              <Image src="/logo.png" alt="XeViệt" fill className="object-cover" />
            </div>
            <span className="font-black text-white text-2xl">XeViệt</span>
          </div>
          <h2 className="text-white text-3xl font-black mb-3 leading-tight">
            Mua bán xe cũ
            <br />
            uy tín hàng đầu
          </h2>
          <p className="text-blue-200 text-sm leading-relaxed max-w-xs">
            Hơn 500.000 người tin tưởng lựa chọn XeViệt để giao dịch xe an toàn, minh bạch.
          </p>
        </div>
      </div>

      {/* Right panel — nơi chứa form (Login hoặc Register) */}
      <div className="flex-1 flex items-center justify-center px-4 py-12 bg-gradient-to-br from-blue-50 to-white">
        {children}
      </div>
    </div>
  );
}
