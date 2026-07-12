"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  FileText, BarChart2, Bookmark, User, LogOut, CheckCircle, Clock, Eye, Plus, Edit, Trash2,
} from "lucide-react";
import Header from "@/components/Header";
import CarCard from "@/components/CarCard";
import { Btn, Chip, Spinner, ErrorNotice } from "@/components/ui";
import { fetchMyCars, deleteCar, type ApiCar } from "@/lib/api-cars";
import { fetchMyFavorites } from "@/lib/api-users";
import { formatVND } from "@/lib/format";
import { toAbsoluteUrl, ApiError } from "@/lib/api";
import { useAuth } from "@/lib/auth";

const STATUS_LABEL: Record<ApiCar["status"], { label: string; variant: "success" | "warning" | "danger" }> = {
  active: { label: "Đang hiển thị", variant: "success" },
  pending: { label: "Chờ duyệt", variant: "warning" },
  rejected: { label: "Bị từ chối", variant: "danger" },
};

export default function SellerDashboardPage() {
  const router = useRouter();
  const { user, isLoading: authLoading, logout } = useAuth();
  const [active, setActive] = useState("listings");

  const [myCars, setMyCars] = useState<ApiCar[]>([]);
  const [favorites, setFavorites] = useState<ApiCar[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!authLoading && !user) router.push("/login");
  }, [authLoading, user, router]);

  const loadListings = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetchMyCars({ limit: 50 });
      setMyCars(res.items);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Không tải được tin đăng.");
    } finally {
      setLoading(false);
    }
  }, []);

  const loadFavorites = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      setFavorites(await fetchMyFavorites());
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Không tải được danh sách yêu thích.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!user) return;
    if (active === "listings") loadListings();
    if (active === "favorites") loadFavorites();
  }, [active, user, loadListings, loadFavorites]);

  const handleDelete = async (id: string) => {
    if (!confirm("Xóa tin đăng này? Hành động không thể hoàn tác.")) return;
    try {
      await deleteCar(id);
      setMyCars((prev) => prev.filter((c) => c._id !== id));
    } catch (err) {
      alert(err instanceof ApiError ? err.message : "Xóa tin thất bại.");
    }
  };

  const menu = [
    { id: "listings", label: "Tin đăng của tôi", icon: FileText },
    { id: "stats", label: "Thống kê", icon: BarChart2 },
    { id: "favorites", label: "Tin yêu thích", icon: Bookmark },
  ];

  const activeCount = myCars.filter((c) => c.status === "active").length;
  const pendingCount = myCars.filter((c) => c.status === "pending").length;
  const totalViews = myCars.reduce((sum, c) => sum + c.views, 0);

  if (authLoading || !user) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="pt-24">
          <Spinner />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="pt-16 min-h-screen bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 flex gap-6">
          {/* Sidebar */}
          <aside className="w-60 flex-shrink-0 hidden md:block">
            <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden shadow-sm">
              <div className="p-5 bg-gradient-to-br from-blue-600 to-blue-800">
                <div className="w-14 h-14 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center font-black text-white text-2xl mb-3 shadow-inner">
                  {user.name[0]?.toUpperCase()}
                </div>
                <p className="font-black text-white">{user.name}</p>
                <p className="text-blue-200 text-xs mt-0.5">{user.email}</p>
              </div>
              <nav className="p-2">
                {menu.map(({ id, label, icon: Icon }) => (
                  <button
                    key={id}
                    onClick={() => setActive(id)}
                    className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition-all mb-0.5 ${
                      active === id ? "bg-blue-50 text-blue-700" : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                    }`}
                  >
                    <Icon size={15} /> {label}
                  </button>
                ))}
                <div className="border-t border-slate-100 mt-2 pt-2">
                  <button
                    onClick={() => router.push("/profile")}
                    className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold text-slate-600 hover:bg-slate-50 transition-colors"
                  >
                    <User size={15} /> Trang cá nhân
                  </button>
                  <button
                    onClick={() => {
                      logout();
                      router.push("/");
                    }}
                    className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold text-red-500 hover:bg-red-50 transition-colors"
                  >
                    <LogOut size={15} /> Đăng xuất
                  </button>
                </div>
              </nav>
            </div>
          </aside>

          {/* Content */}
          <div className="flex-1">
            {active === "listings" && (
              <div>
                <div className="flex items-center justify-between mb-5">
                  <div>
                    <h2 className="text-xl font-black text-slate-900">Tin đăng của tôi</h2>
                    <p className="text-slate-500 text-sm">Quản lý toàn bộ tin đăng</p>
                  </div>
                  <Btn onClick={() => router.push("/post-car")}>
                    <Plus size={15} /> Đăng tin mới
                  </Btn>
                </div>

                <div className="grid grid-cols-3 gap-4 mb-6">
                  {[
                    { label: "Đang hiển thị", value: activeCount, icon: CheckCircle, bg: "bg-emerald-50", fg: "text-emerald-600" },
                    { label: "Chờ duyệt", value: pendingCount, icon: Clock, bg: "bg-amber-50", fg: "text-amber-600" },
                    { label: "Tổng lượt xem", value: totalViews, icon: Eye, bg: "bg-blue-50", fg: "text-blue-600" },
                  ].map(({ label, value, icon: Icon, bg, fg }) => (
                    <div key={label} className="bg-white rounded-2xl border border-slate-100 p-4 flex items-center gap-3">
                      <div className={`w-11 h-11 rounded-xl flex items-center justify-center ${bg}`}>
                        <Icon size={18} className={fg} />
                      </div>
                      <div>
                        <p className="text-2xl font-black text-slate-900">{value.toLocaleString()}</p>
                        <p className="text-xs text-slate-500">{label}</p>
                      </div>
                    </div>
                  ))}
                </div>

                {loading ? (
                  <Spinner />
                ) : error ? (
                  <ErrorNotice message={error} onRetry={loadListings} />
                ) : myCars.length === 0 ? (
                  <div className="bg-white rounded-2xl border border-slate-100 p-10 text-center text-sm text-slate-500">
                    Bạn chưa có tin đăng nào.{" "}
                    <button onClick={() => router.push("/post-car")} className="text-blue-600 font-bold hover:underline">
                      Đăng tin ngay
                    </button>
                  </div>
                ) : (
                  <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden">
                    <div className="px-5 py-3.5 border-b border-slate-100">
                      <h3 className="font-black text-slate-900 text-sm">Danh sách tin đăng ({myCars.length})</h3>
                    </div>
                    <div className="divide-y divide-slate-50">
                      {myCars.map((car) => {
                        const status = STATUS_LABEL[car.status];
                        return (
                          <div key={car._id} className="flex items-center gap-4 px-5 py-3.5 hover:bg-slate-50 transition-colors">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img
                              src={
                                car.images?.[0]
                                  ? toAbsoluteUrl(car.images[0])
                                  : "https://images.unsplash.com/photo-1502877338535-766e1452684a?w=200&h=150&fit=crop&auto=format"
                              }
                              alt=""
                              className="w-16 h-11 object-cover rounded-xl flex-shrink-0"
                            />
                            <div className="flex-1 min-w-0 cursor-pointer" onClick={() => router.push(`/car/${car._id}`)}>
                              <p className="font-bold text-slate-900 text-sm truncate">{car.name}</p>
                              <p className="text-blue-600 font-black text-sm">{formatVND(car.price)}</p>
                              <div className="flex items-center gap-3 text-xs text-slate-400 mt-0.5">
                                <span className="flex items-center gap-1">
                                  <Eye size={10} /> {car.views}
                                </span>
                              </div>
                            </div>
                            <Chip variant={status.variant}>{status.label}</Chip>
                            <div className="flex gap-1 flex-shrink-0">
                              <button
                                onClick={() => router.push(`/car/${car._id}`)}
                                title="Xem chi tiết"
                                className="p-2 rounded-xl hover:bg-blue-50 text-slate-400 hover:text-blue-600 transition-colors"
                              >
                                <Edit size={14} />
                              </button>
                              <button
                                onClick={() => handleDelete(car._id)}
                                title="Xóa tin"
                                className="p-2 rounded-xl hover:bg-red-50 text-slate-400 hover:text-red-500 transition-colors"
                              >
                                <Trash2 size={14} />
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            )}

            {active === "stats" && (
              <div>
                <h2 className="text-xl font-black text-slate-900 mb-5">Thống kê</h2>
                <div className="grid grid-cols-3 gap-4 mb-6">
                  {[
                    { label: "Tổng tin đăng", value: myCars.length },
                    { label: "Đang hiển thị", value: activeCount },
                    { label: "Tổng lượt xem", value: totalViews },
                  ].map(({ label, value }) => (
                    <div key={label} className="bg-white rounded-2xl border border-slate-100 p-5">
                      <p className="text-sm text-slate-500 mb-2">{label}</p>
                      <p className="text-3xl font-black text-slate-900">{value.toLocaleString()}</p>
                    </div>
                  ))}
                </div>
                {myCars.length === 0 && !loading && (
                  <p className="text-sm text-slate-500">Đăng tin để bắt đầu theo dõi lượt xem và hiệu quả tin đăng của bạn.</p>
                )}
              </div>
            )}

            {active === "favorites" && (
              <div>
                <h2 className="text-xl font-black text-slate-900 mb-5">Tin yêu thích</h2>
                {loading ? (
                  <Spinner />
                ) : error ? (
                  <ErrorNotice message={error} onRetry={loadFavorites} />
                ) : favorites.length === 0 ? (
                  <div className="bg-white rounded-2xl border border-slate-100 p-10 text-center text-sm text-slate-500">
                    Bạn chưa yêu thích xe nào.{" "}
                    <button onClick={() => router.push("/search")} className="text-blue-600 font-bold hover:underline">
                      Khám phá ngay
                    </button>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
                    {favorites.map((car) => (
                      <CarCard key={car._id} car={car} onClick={() => router.push(`/car/${car._id}`)} />
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
