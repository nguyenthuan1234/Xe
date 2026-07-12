"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowLeft, ArrowRight, Heart, Eye, Clock, MapPin, Calendar, Gauge, Fuel, Cog,
  CheckCircle, Phone, MessageCircle, Send, AlertCircle,
} from "lucide-react";
import Header from "@/components/Header";
import { Chip, Btn, Spinner, ErrorNotice } from "@/components/ui";
import { fetchCarById, sellerName, type ApiCar } from "@/lib/api-cars";
import { toggleFavorite } from "@/lib/api-users";
import { formatVND, formatRelativeTime } from "@/lib/format";
import { toAbsoluteUrl, ApiError } from "@/lib/api";
import { useAuth } from "@/lib/auth";

const FALLBACK_IMAGE = "https://images.unsplash.com/photo-1502877338535-766e1452684a?w=900&h=560&fit=crop&auto=format";

export default function CarDetailPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const { user } = useAuth();
  const [car, setCar] = useState<ApiCar | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [activeImg, setActiveImg] = useState(0);
  const [liked, setLiked] = useState(false);
  const [favBusy, setFavBusy] = useState(false);

  useEffect(() => {
    let mounted = true;
    setLoading(true);
    fetchCarById(params.id)
      .then((data) => {
        if (mounted) setCar(data);
      })
      .catch((err) => {
        if (mounted) setError(err instanceof ApiError ? err.message : "Không tải được thông tin xe.");
      })
      .finally(() => {
        if (mounted) setLoading(false);
      });
    return () => {
      mounted = false;
    };
  }, [params.id]);

  const handleToggleFavorite = async () => {
    if (!user) {
      router.push("/login");
      return;
    }
    if (favBusy) return;
    setFavBusy(true);
    try {
      const res = await toggleFavorite(params.id);
      setLiked(res.favorited);
    } catch {
      // bỏ qua lỗi tạm thời
    } finally {
      setFavBusy(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="pt-24">
          <Spinner />
        </div>
      </div>
    );
  }

  if (error || !car) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="max-w-3xl mx-auto px-4 sm:px-6 pt-28 pb-14">
          <ErrorNotice message={error || "Không tìm thấy xe."} />
          <div className="text-center mt-6">
            <Btn variant="ghost" onClick={() => router.push("/search")}>
              <ArrowLeft size={15} /> Quay lại tìm kiếm
            </Btn>
          </div>
        </div>
      </div>
    );
  }

  const images = car.images && car.images.length > 0 ? car.images.map((i) => toAbsoluteUrl(i)) : [FALLBACK_IMAGE];

  const specs: [string, string][] = [
    ["Năm sản xuất", String(car.year)],
    ["Số km đã đi", `${car.km.toLocaleString()} km`],
    ["Nhiên liệu", car.fuel],
    ["Hộp số", car.transmission],
    ["Loại xe", car.type],
    ["Khu vực", car.location],
  ];

  const conditionEntries = Object.entries(car.condition || {});
  const legalEntries = Object.entries(car.legalInfo || {});

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 pt-24 pb-14">
        <button
          onClick={() => router.push("/search")}
          className="flex items-center gap-1.5 text-sm text-slate-500 hover:text-blue-600 mb-6 transition-colors font-medium"
        >
          <ArrowLeft size={15} /> Quay lại kết quả tìm kiếm
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left */}
          <div className="lg:col-span-2 space-y-5">
            {/* Gallery */}
            <div className="relative rounded-2xl overflow-hidden bg-slate-900">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={images[activeImg]} alt={car.name} className="w-full h-[420px] object-cover" />
              <button
                onClick={handleToggleFavorite}
                disabled={favBusy}
                className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm w-10 h-10 rounded-full flex items-center justify-center shadow-lg hover:scale-110 transition-transform disabled:opacity-60"
              >
                <Heart size={17} className={liked ? "fill-red-500 text-red-500" : "text-slate-600"} />
              </button>
              <div className="absolute bottom-4 right-4 bg-black/60 backdrop-blur-sm text-white text-xs font-bold px-2.5 py-1.5 rounded-lg">
                {activeImg + 1}/{images.length}
              </div>
              {activeImg > 0 && (
                <button
                  onClick={() => setActiveImg((i) => i - 1)}
                  className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center shadow-lg hover:scale-105 transition-transform"
                >
                  <ArrowLeft size={17} />
                </button>
              )}
              {activeImg < images.length - 1 && (
                <button
                  onClick={() => setActiveImg((i) => i + 1)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center shadow-lg hover:scale-105 transition-transform"
                >
                  <ArrowRight size={17} />
                </button>
              )}
            </div>
            {images.length > 1 && (
              <div className="flex gap-2">
                {images.map((img, i) => (
                  <button
                    key={i}
                    onClick={() => setActiveImg(i)}
                    className={`rounded-xl overflow-hidden border-2 transition-all flex-shrink-0 ${
                      activeImg === i ? "border-blue-600 shadow-md" : "border-transparent opacity-60 hover:opacity-100"
                    }`}
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={img} alt="" className="w-20 h-14 object-cover" />
                  </button>
                ))}
              </div>
            )}

            {/* Title */}
            <div className="bg-white rounded-2xl border border-slate-100 p-5">
              <div className="flex items-center gap-2 mb-2">
                {car.badge && <Chip>{car.badge}</Chip>}
                {car.verified && (
                  <Chip variant="success">
                    <CheckCircle size={10} /> Đã xác minh
                  </Chip>
                )}
              </div>
              <h1 className="text-2xl font-black text-slate-900 mb-2">{car.name}</h1>
              <p className="text-blue-600 text-3xl font-black mb-3">{formatVND(car.price)}</p>
              <div className="flex flex-wrap items-center gap-5 text-sm text-slate-500">
                <span className="flex items-center gap-1.5">
                  <Eye size={14} /> {car.views.toLocaleString()} lượt xem
                </span>
                <span className="flex items-center gap-1.5">
                  <Clock size={14} /> {formatRelativeTime(car.createdAt)}
                </span>
                <span className="flex items-center gap-1.5">
                  <MapPin size={14} /> {car.location}
                </span>
              </div>
            </div>

            {/* Quick specs */}
            <div className="grid grid-cols-4 gap-3">
              {[
                { icon: Calendar, v: String(car.year), l: "Năm SX" },
                { icon: Gauge, v: car.km.toLocaleString(), l: "Số km" },
                { icon: Fuel, v: car.fuel, l: "Nhiên liệu" },
                { icon: Cog, v: car.transmission, l: "Hộp số" },
              ].map(({ icon: Icon, v, l }) => (
                <div key={l} className="bg-blue-50 border border-blue-100 rounded-2xl p-4 text-center">
                  <Icon size={20} className="text-blue-600 mx-auto mb-2" />
                  <p className="font-black text-slate-900 text-sm">{v}</p>
                  <p className="text-xs text-slate-500 mt-0.5">{l}</p>
                </div>
              ))}
            </div>

            {/* Description */}
            {car.description && (
              <div className="bg-white rounded-2xl border border-slate-100 p-5">
                <h3 className="font-black text-slate-900 mb-3">Mô tả</h3>
                <p className="text-sm text-slate-600 leading-relaxed whitespace-pre-line">{car.description}</p>
              </div>
            )}

            {/* Specs table */}
            <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden">
              <div className="px-5 py-3.5 border-b border-slate-100">
                <h3 className="font-black text-slate-900">Thông số kỹ thuật</h3>
              </div>
              <div className="divide-y divide-slate-50">
                {specs.map(([label, value]) => (
                  <div key={label} className="flex items-center justify-between px-5 py-3 hover:bg-blue-50/30 transition-colors">
                    <span className="text-sm text-slate-500">{label}</span>
                    <span className="text-sm font-bold text-slate-900">{value}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Condition */}
            {conditionEntries.length > 0 && (
              <div className="bg-white rounded-2xl border border-slate-100 p-5">
                <h3 className="font-black text-slate-900 mb-4">Tình trạng xe</h3>
                <div className="grid grid-cols-2 gap-2.5">
                  {conditionEntries.map(([l, v]) => (
                    <div key={l} className="flex items-center justify-between bg-slate-50 rounded-xl px-4 py-2.5">
                      <span className="text-xs text-slate-600">{l}</span>
                      <span className="text-xs font-bold text-emerald-600">{v}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Legal */}
            {legalEntries.length > 0 && (
              <div className="bg-white rounded-2xl border border-slate-100 p-5">
                <h3 className="font-black text-slate-900 mb-4">Thông tin pháp lý</h3>
                <div className="space-y-2.5">
                  {legalEntries.map(([l, v]) => (
                    <div key={l} className="flex items-center justify-between py-2.5 border-b border-slate-50 last:border-0">
                      <span className="text-sm text-slate-500">{l}</span>
                      <span className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
                        <CheckCircle size={12} className="text-emerald-500" /> {v}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Right: Seller card */}
          <div>
            <div className="bg-white rounded-2xl border border-slate-100 shadow-lg shadow-blue-900/5 p-5 sticky top-24">
              <div className="flex items-center gap-3 mb-5 pb-5 border-b border-slate-100">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-400 to-blue-700 flex items-center justify-center font-black text-white text-2xl shadow-md">
                  {sellerName(car)[0]?.toUpperCase()}
                </div>
                <div>
                  <p className="font-black text-slate-900">{sellerName(car)}</p>
                  {typeof car.seller !== "string" && car.seller.verifiedSeller && (
                    <div className="flex items-center gap-1.5">
                      <CheckCircle size={12} className="text-emerald-500" />
                      <span className="text-xs text-emerald-600 font-bold">Người bán uy tín</span>
                    </div>
                  )}
                </div>
              </div>

              <div className="space-y-2.5 mb-5">
                <div className="flex items-center gap-2.5 text-sm text-slate-600 bg-slate-50 rounded-xl px-3.5 py-2.5">
                  <MapPin size={14} className="text-blue-500 flex-shrink-0" /> {car.location}
                </div>
              </div>

              <div className="space-y-2.5">
                <a href={`tel:${car.sellerPhone}`}>
                  <Btn size="lg" className="w-full">
                    <Phone size={16} /> Gọi: {car.sellerPhone}
                  </Btn>
                </a>
                <Btn size="lg" variant="secondary" className="w-full" onClick={() => (user ? undefined : router.push("/login"))}>
                  <MessageCircle size={16} /> Chat với người bán
                </Btn>
                <Btn size="lg" variant="outline" className="w-full" onClick={() => (user ? undefined : router.push("/login"))}>
                  <Send size={16} /> Gửi yêu cầu xem xe
                </Btn>
              </div>

              <div className="mt-4 p-3.5 bg-amber-50 rounded-xl border border-amber-100 text-xs text-amber-700 leading-relaxed">
                <AlertCircle size={12} className="inline mr-1" />
                Kiểm tra kỹ xe trước khi đặt cọc. XeViệt không chịu trách nhiệm giao dịch ngoài hệ thống.
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
