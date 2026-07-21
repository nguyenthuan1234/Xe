"use client";

import Image from "next/image";
import Link from "next/link";
import { Phone, Mail, MapPin, Globe } from "lucide-react";

export default function Footer() {
  return (
    <footer className="bg-slate-900 text-slate-400 mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-14">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-10">
          <div className="col-span-2 md:col-span-1">
            <div className="flex items-center gap-2.5 mb-4">
              <div className="w-9 h-9 rounded-xl overflow-hidden relative flex-shrink-0">
                <Image src="/logo.png" alt="XeViệt" fill className="object-cover" />
              </div>
              <span className="font-black text-white text-lg">XeViệt</span>
            </div>
            <p className="text-xs text-slate-500 leading-relaxed mb-4">
              Sàn giao dịch xe cũ uy tín hàng đầu Việt Nam. Mua bán xe an toàn, minh bạch, đáng tin cậy.
            </p>
            <div className="flex gap-2">
              {["fb", "yt", "zl"].map((s) => (
                <div
                  key={s}
                  className="w-8 h-8 rounded-lg bg-slate-800 flex items-center justify-center hover:bg-blue-600 transition-colors cursor-pointer text-[10px] font-bold text-slate-400 hover:text-white"
                >
                  {s.toUpperCase()}
                </div>
              ))}
            </div>
          </div>
          <div>
            <h4 className="font-bold text-white text-sm mb-4">Sản phẩm</h4>
            <ul className="space-y-2.5 text-xs">
              {[
                ["Tìm xe cũ", "/search"],
                ["Đăng tin bán xe", "/post-car"],

              ].map(([label, href]) => (
                <li key={label}>
                  <Link href={href} className="hover:text-white transition-colors">
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="font-bold text-white text-sm mb-4">Liên hệ</h4>
            <ul className="space-y-2.5 text-xs">
              <li className="flex items-center gap-2">
                <Phone size={12} className="text-blue-500" /> 1800 6789 (miễn phí)
              </li>
              <li className="flex items-center gap-2">
                <Mail size={12} className="text-blue-500" /> support@xviet.vn
              </li>
              <li className="flex items-center gap-2">
                <MapPin size={12} className="text-blue-500" /> Hà Nội &amp; TP.HCM
              </li>
              <li className="flex items-center gap-2">
                <Globe size={12} className="text-blue-500" /> www.xviet.vn
              </li>
            </ul>
          </div>
        </div>
        <div className="border-t border-slate-800 pt-6 flex flex-col sm:flex-row justify-between items-center gap-2 text-xs text-slate-600">
          <p>© 2024 XeViệt JSC. Tất cả quyền được bảo lưu.</p>

        </div>
      </div>
    </footer>
  );
}
