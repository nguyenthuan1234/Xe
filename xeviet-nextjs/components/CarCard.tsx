"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Heart, Eye, Calendar, Gauge, Fuel, MapPin, CheckCircle } from "lucide-react";
import type { ApiCar } from "@/lib/api-cars";
import { sellerName } from "@/lib/api-cars";
import { formatVND, formatRelativeTime } from "@/lib/format";
import { toAbsoluteUrl } from "@/lib/api";
import { useAuth } from "@/lib/auth";
import { toggleFavorite } from "@/lib/api-users";

const FALLBACK_IMAGE = "https://images.unsplash.com/photo-1502877338535-766e1452684a?w=600&h=400&fit=crop&auto=format";

export default function CarCard({ car, onClick }: { car: ApiCar; onClick?: () => void }) {
  const { user } = useAuth();
  const [liked, setLiked] = useState(false);
  const [busy, setBusy] = useState(false);

  const image = car.images?.[0] ? toAbsoluteUrl(car.images[0]) : FALLBACK_IMAGE;

  const handleToggleFavorite = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!user) {
      window.location.href = "/login";
      return;
    }
    if (busy) return;
    setBusy(true);
    try {
      const res = await toggleFavorite(car._id);
      setLiked(res.favorited);
    } catch {
      // bỏ qua lỗi mạng tạm thời
    } finally {
      setBusy(false);
    }
  };

  return (
    <motion.div
      whileHover={{ y: -5, boxShadow: "0 20px 40px rgba(37,99,235,0.12)" }}
      transition={{ duration: 0.2 }}
      className="bg-white rounded-2xl overflow-hidden border border-slate-100 cursor-pointer group"
      onClick={onClick}
    >
      <div className="relative overflow-hidden bg-slate-100">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={image} alt={car.name} className="w-full h-52 object-cover group-hover:scale-105 transition-transform duration-500" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent" />
        {car.badge && (
          <span className="absolute top-3 left-3 bg-blue-600 text-white text-[11px] font-bold px-2.5 py-1 rounded-lg shadow-md">
            {car.badge}
          </span>
        )}
        <button
          onClick={handleToggleFavorite}
          className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm w-8 h-8 rounded-full flex items-center justify-center shadow-md hover:scale-110 transition-transform disabled:opacity-60"
          disabled={busy}
        >
          <Heart size={14} className={liked ? "fill-red-500 text-red-500" : "text-slate-500"} />
        </button>
        <div className="absolute bottom-3 left-3 flex items-center gap-1 text-white text-[11px] font-medium">
          <Eye size={11} /> {car.views.toLocaleString()} lượt xem
        </div>
      </div>
      <div className="p-4">
        <h3 className="font-bold text-slate-900 text-sm leading-snug mb-1 line-clamp-2">{car.name}</h3>
        <p className="text-blue-600 font-black text-lg mb-3">{formatVND(car.price)}</p>
        <div className="grid grid-cols-2 gap-1.5 text-xs text-slate-500 mb-3">
          <span className="flex items-center gap-1.5">
            <Calendar size={11} className="text-blue-400" /> {car.year}
          </span>
          <span className="flex items-center gap-1.5">
            <Gauge size={11} className="text-blue-400" /> {car.km.toLocaleString()} km
          </span>
          <span className="flex items-center gap-1.5">
            <Fuel size={11} className="text-blue-400" /> {car.fuel}
          </span>
          <span className="flex items-center gap-1.5">
            <MapPin size={11} className="text-blue-400" /> {car.location}
          </span>
        </div>
        <div className="flex items-center justify-between pt-3 border-t border-slate-100">
          <div className="flex items-center gap-1.5">
            <div className="w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center font-bold text-blue-600 text-[10px]">
              {sellerName(car)[0]?.toUpperCase()}
            </div>
            <span className="text-xs text-slate-600 font-medium">{sellerName(car)}</span>
            {car.verified && <CheckCircle size={11} className="text-emerald-500" />}
          </div>
          <span className="text-[11px] text-slate-400">{formatRelativeTime(car.createdAt)}</span>
        </div>
      </div>
    </motion.div>
  );
}
