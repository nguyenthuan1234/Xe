import type { Metadata } from "next";
import "./globals.css";
import { AuthProvider } from "@/lib/auth";

export const metadata: Metadata = {
  title: "XeViệt – Mua Bán Xe Cũ Uy Tín Toàn Quốc",
  description: "Sàn giao dịch xe cũ uy tín hàng đầu Việt Nam. Mua bán xe an toàn, minh bạch, đáng tin cậy.",
  icons: {
    icon: "/favicon-32.png",
    shortcut: "/favicon-32.png",
    apple: "/apple-touch-icon.png",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="vi">
      <body className="min-h-screen bg-background text-slate-900 antialiased">
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
