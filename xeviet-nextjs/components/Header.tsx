"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  Menu,
  X,
  User,
  BarChart2,
  Shield,
  LogOut,
  MessageCircle,
} from "lucide-react";
import { Btn } from "./ui";
import { useAuth } from "@/lib/auth";

export default function Header() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const pathname = usePathname();
  const router = useRouter();
  const { user, isLoading, logout } = useAuth();

  useEffect(() => {
    const h = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", h);
    return () => window.removeEventListener("scroll", h);
  }, []);

  const navLinks = [
    { label: "Trang chủ", href: "/" },
    { label: "Tìm xe", href: "/search" },
    { label: "Đăng tin", href: "/post-car" },
  ];

  const roleLink =
    !isLoading && user
      ? user.role === "admin"
        ? { label: "Trang Admin", href: "/admin", icon: Shield }
        : { label: "Dashboard", href: "/seller", icon: BarChart2 }
      : null;

  const handleLogout = () => {
    logout();
    setOpen(false);
    router.push("/");
  };

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled
          ? "bg-white/95 backdrop-blur-lg shadow-lg shadow-blue-900/5 border-b border-blue-50"
          : "bg-white/90 backdrop-blur-md"
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-16">
          <Link href="/" className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl overflow-hidden shadow-md shadow-blue-500/30 relative flex-shrink-0">
              <Image
                src="/logo.png"
                alt="XeViệt"
                fill
                className="object-cover"
                priority
              />
            </div>
            <div className="flex flex-col leading-none">
              <span className="font-black text-slate-900 text-[17px] tracking-tight">
                XeViệt
              </span>
              <span className="text-blue-500 text-[9px] font-bold tracking-widest uppercase">
                Mua Bán Xe Cũ
              </span>
            </div>
          </Link>

          <nav className="hidden md:flex items-center gap-1">
            {navLinks.map(({ label, href }) => (
              <Link
                key={label}
                href={href}
                className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all ${
                  pathname === href
                    ? "text-blue-600 bg-blue-50"
                    : "text-slate-600 hover:text-blue-600 hover:bg-blue-50"
                }`}
              >
                {label}
              </Link>
            ))}
            {!isLoading && user && (
              <Link
                href="/messages"
                className="px-4 py-2 rounded-xl text-sm font-semibold text-slate-600 hover:text-blue-600 hover:bg-blue-50 transition-all flex items-center gap-1.5"
              >
                <MessageCircle size={14} /> Tin nhắn
              </Link>
            )}
            {roleLink && (
              <Link
                href={roleLink.href}
                className="px-4 py-2 rounded-xl text-sm font-semibold text-slate-600 hover:text-blue-600 hover:bg-blue-50 transition-all flex items-center gap-1.5"
              >
                <roleLink.icon size={14} /> {roleLink.label}
              </Link>
            )}
          </nav>

          <div className="flex items-center gap-2">
            {!isLoading && user ? (
              <>
                <Link
                  href="/profile"
                  className="hidden md:flex items-center gap-2 p-1.5 pr-3 rounded-xl hover:bg-slate-100 text-slate-600 transition-colors"
                >
                  <div className="w-7 h-7 rounded-full bg-blue-100 flex items-center justify-center font-bold text-blue-600 text-xs">
                    {user.name[0]?.toUpperCase()}
                  </div>
                  <span className="text-sm font-semibold max-w-[110px] truncate">
                    {user.name}
                  </span>
                </Link>
                <Btn
                  variant="ghost"
                  size="sm"
                  onClick={handleLogout}
                  className="hidden md:flex"
                >
                  <LogOut size={14} /> Đăng xuất
                </Btn>
              </>
            ) : (
              <>
                <Link href="/login" className="hidden md:block">
                  <Btn variant="ghost" size="sm">
                    Đăng nhập
                  </Btn>
                </Link>
                <Link href="/register">
                  <Btn size="sm">Đăng ký</Btn>
                </Link>
              </>
            )}
            <button
              className="md:hidden p-2 rounded-xl hover:bg-slate-100"
              onClick={() => setOpen((v) => !v)}
            >
              {open ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>
      </div>

      {open && (
        <div className="md:hidden bg-white border-t border-slate-100 px-4 py-3 flex flex-col gap-1">
          {navLinks.map(({ label, href }) => (
            <Link
              key={label}
              href={href}
              onClick={() => setOpen(false)}
              className="text-left px-3 py-2.5 rounded-xl text-sm font-medium text-slate-700 hover:bg-blue-50 hover:text-blue-700 transition-colors"
            >
              {label}
            </Link>
          ))}

          {!isLoading && user && (
            <Link
              href="/messages"
              onClick={() => setOpen(false)}
              className="text-left px-3 py-2.5 rounded-xl text-sm font-medium text-slate-700 hover:bg-blue-50 hover:text-blue-700 transition-colors flex items-center gap-2"
            >
              <MessageCircle size={15} /> Tin nhắn
            </Link>
          )}

          {roleLink && (
            <Link
              href={roleLink.href}
              onClick={() => setOpen(false)}
              className="text-left px-3 py-2.5 rounded-xl text-sm font-medium text-slate-700 hover:bg-blue-50 hover:text-blue-700 transition-colors flex items-center gap-2"
            >
              <roleLink.icon size={15} /> {roleLink.label}
            </Link>
          )}

          {!isLoading && user ? (
            <>
              <Link
                href="/profile"
                onClick={() => setOpen(false)}
                className="text-left px-3 py-2.5 rounded-xl text-sm font-medium text-slate-700 hover:bg-blue-50 hover:text-blue-700 transition-colors flex items-center gap-2"
              >
                <User size={15} /> Trang cá nhân
              </Link>
              <button
                onClick={handleLogout}
                className="text-left px-3 py-2.5 rounded-xl text-sm font-medium text-red-500 hover:bg-red-50 transition-colors flex items-center gap-2"
              >
                <LogOut size={15} /> Đăng xuất
              </button>
            </>
          ) : (
            <Link
              href="/login"
              onClick={() => setOpen(false)}
              className="text-left px-3 py-2.5 rounded-xl text-sm font-medium text-slate-700 hover:bg-blue-50 hover:text-blue-700 transition-colors"
            >
              Đăng nhập
            </Link>
          )}
        </div>
      )}
    </header>
  );
}
