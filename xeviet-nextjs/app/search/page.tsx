"use client";

import { Suspense, useCallback, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import {
  Search, Filter, LayoutGrid, List, Calendar, Gauge, Fuel, MapPin, Eye, Clock, Heart, Phone, ArrowLeft, ArrowRight,
} from "lucide-react";
import Header from "@/components/Header";
import CarCard from "@/components/CarCard";
import { Dropdown, Btn, Chip, Spinner, ErrorNotice } from "@/components/ui";
import { fetchCars, type ApiCar, type CarQueryParams } from "@/lib/api-cars";
import { fetchCategories, type ApiCategory } from "@/lib/api-categories";
import { formatVND, formatRelativeTime } from "@/lib/format";
import { toAbsoluteUrl, ApiError } from "@/lib/api";

const SORT_OPTIONS: { value: CarQueryParams["sort"]; label: string }[] = [
  { value: "newest", label: "Mới nhất" },
  { value: "price_asc", label: "Giá thấp – cao" },
  { value: "price_desc", label: "Giá cao – thấp" },
  { value: "most_viewed", label: "Xem nhiều nhất" },
];

function SearchPageInner() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [view, setView] = useState<"grid" | "list">("grid");
  const [search, setSearch] = useState(searchParams.get("search") ?? "");
  const [brand, setBrand] = useState(searchParams.get("brand") ?? "");
  const [type, setType] = useState(searchParams.get("type") ?? "");
  const [location, setLocation] = useState(searchParams.get("location") ?? "");
  const [sort, setSort] = useState<CarQueryParams["sort"]>("newest");
  const [page, setPage] = useState(1);

  const [brands, setBrands] = useState<ApiCategory[]>([]);
  const [carTypes, setCarTypes] = useState<ApiCategory[]>([]);
  const [locations, setLocations] = useState<ApiCategory[]>([]);

  const [result, setResult] = useState<{ items: ApiCar[]; total: number; totalPages: number }>({
    items: [],
    total: 0,
    totalPages: 1,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    Promise.all([fetchCategories("brand"), fetchCategories("carType"), fetchCategories("location")])
      .then(([b, t, l]) => {
        setBrands(b);
        setCarTypes(t);
        setLocations(l);
      })
      .catch(() => undefined);
  }, []);

  const runSearch = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetchCars({
        search: search || undefined,
        brand: brand || undefined,
        type: type || undefined,
        location: location || undefined,
        sort,
        page,
        limit: 12,
      });
      setResult({ items: res.items, total: res.total, totalPages: res.totalPages });
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Không tải được danh sách xe.");
    } finally {
      setLoading(false);
    }
  }, [search, brand, type, location, sort, page]);

  useEffect(() => {
    runSearch();
  }, [runSearch]);

  const applyFilters = () => {
    setPage(1);
    runSearch();
  };

  const clearFilters = () => {
    setBrand("");
    setType("");
    setLocation("");
    setSearch("");
    setSort("newest");
    setPage(1);
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 pt-24 pb-14">
        {/* Search bar */}
        <div className="flex flex-col sm:flex-row gap-3 mb-6">
          <div className="flex-1 relative">
            <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && applyFilters()}
              placeholder="Tìm kiếm xe theo tên, hãng, mẫu..."
              className="w-full bg-white border border-slate-200 rounded-2xl py-3.5 pl-10 pr-4 text-sm shadow-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all"
            />
          </div>
          <Btn size="md" onClick={applyFilters}>
            <Search size={15} /> Tìm kiếm
          </Btn>
        </div>

        <div className="flex gap-6">
          {/* Filter sidebar */}
          <aside className="hidden md:block w-64 flex-shrink-0">
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5 sticky top-24">
              <div className="flex items-center justify-between mb-5">
                <h3 className="font-bold text-slate-900 flex items-center gap-2">
                  <Filter size={15} className="text-blue-500" /> Bộ lọc
                </h3>
                <button onClick={clearFilters} className="text-xs text-blue-600 font-bold hover:underline">
                  Xóa tất cả
                </button>
              </div>
              <div className="space-y-3.5">
                <Dropdown label="Hãng xe" placeholder="Tất cả hãng" options={brands.map((b) => b.name)} value={brand} onChange={setBrand} />
                <Dropdown label="Loại xe" placeholder="Tất cả loại" options={carTypes.map((t) => t.name)} value={type} onChange={setType} />
                <Dropdown label="Khu vực" placeholder="Toàn quốc" options={locations.map((l) => l.name)} value={location} onChange={setLocation} />
                <Btn size="md" className="w-full" onClick={applyFilters}>
                  <Filter size={14} /> Áp dụng
                </Btn>
              </div>
            </div>
          </aside>

          {/* Results */}
          <div className="flex-1">
            <div className="flex items-center justify-between mb-4">
              <p className="text-sm text-slate-600">
                Tìm thấy <span className="font-black text-slate-900">{result.total.toLocaleString()}</span> xe
              </p>
              <div className="flex items-center gap-2.5">
                <div className="flex items-center gap-1 bg-white rounded-xl border border-slate-200 p-1">
                  <button
                    onClick={() => setView("grid")}
                    className={`p-2 rounded-lg transition-all ${view === "grid" ? "bg-blue-600 text-white shadow-sm" : "text-slate-400 hover:text-slate-600"}`}
                  >
                    <LayoutGrid size={13} />
                  </button>
                  <button
                    onClick={() => setView("list")}
                    className={`p-2 rounded-lg transition-all ${view === "list" ? "bg-blue-600 text-white shadow-sm" : "text-slate-400 hover:text-slate-600"}`}
                  >
                    <List size={13} />
                  </button>
                </div>
                <Dropdown
                  options={SORT_OPTIONS.map((o) => o.label)}
                  value={SORT_OPTIONS.find((o) => o.value === sort)?.label}
                  onChange={(label) => {
                    const found = SORT_OPTIONS.find((o) => o.label === label);
                    setSort(found?.value ?? "newest");
                    setPage(1);
                  }}
                />
              </div>
            </div>

            {loading ? (
              <Spinner />
            ) : error ? (
              <ErrorNotice message={error} onRetry={runSearch} />
            ) : result.items.length === 0 ? (
              <div className="text-center py-20 text-slate-500 text-sm">Không tìm thấy xe phù hợp với bộ lọc hiện tại.</div>
            ) : view === "grid" ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
                {result.items.map((car) => (
                  <CarCard key={car._id} car={car} onClick={() => router.push(`/car/${car._id}`)} />
                ))}
              </div>
            ) : (
              <div className="flex flex-col gap-3">
                {result.items.map((car) => (
                  <motion.div
                    key={car._id}
                    whileHover={{ scale: 1.005 }}
                    className="bg-white rounded-2xl border border-slate-100 overflow-hidden flex cursor-pointer hover:shadow-lg hover:shadow-blue-500/8 transition-shadow"
                    onClick={() => router.push(`/car/${car._id}`)}
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={
                        car.images?.[0]
                          ? toAbsoluteUrl(car.images[0])
                          : "https://images.unsplash.com/photo-1502877338535-766e1452684a?w=400&h=300&fit=crop&auto=format"
                      }
                      alt={car.name}
                      className="w-44 object-cover flex-shrink-0"
                    />
                    <div className="p-4 flex-1">
                      <div className="flex items-start justify-between gap-2">
                        <h3 className="font-bold text-slate-900 text-sm leading-snug">{car.name}</h3>
                        {car.badge && <Chip>{car.badge}</Chip>}
                      </div>
                      <p className="text-blue-600 font-black text-lg mt-1">{formatVND(car.price)}</p>
                      <div className="flex flex-wrap gap-4 mt-2 text-xs text-slate-500">
                        <span className="flex items-center gap-1">
                          <Calendar size={11} /> {car.year}
                        </span>
                        <span className="flex items-center gap-1">
                          <Gauge size={11} /> {car.km.toLocaleString()} km
                        </span>
                        <span className="flex items-center gap-1">
                          <Fuel size={11} /> {car.fuel}
                        </span>
                        <span className="flex items-center gap-1">
                          <MapPin size={11} /> {car.location}
                        </span>
                      </div>
                      <div className="flex items-center justify-between mt-3">
                        <div className="flex items-center gap-1.5 text-xs text-slate-500">
                          <Eye size={11} /> {car.views} · <Clock size={11} /> {formatRelativeTime(car.createdAt)}
                        </div>
                        <div className="flex gap-2" onClick={(e) => e.stopPropagation()}>
                          <Btn size="sm" variant="secondary">
                            <Heart size={12} />
                          </Btn>
                          <a href={`tel:${car.sellerPhone}`}>
                            <Btn size="sm">
                              <Phone size={12} /> Gọi ngay
                            </Btn>
                          </a>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}

            {/* Pagination */}
            {!loading && !error && result.totalPages > 1 && (
              <div className="flex items-center justify-center gap-1.5 mt-10">
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page <= 1}
                  className="w-9 h-9 rounded-xl border border-slate-200 flex items-center justify-center text-slate-400 hover:border-blue-300 hover:text-blue-600 transition-colors disabled:opacity-40"
                >
                  <ArrowLeft size={14} />
                </button>
                {Array.from({ length: result.totalPages }, (_, i) => i + 1)
                  .slice(0, 7)
                  .map((p) => (
                    <button
                      key={p}
                      onClick={() => setPage(p)}
                      className={`w-9 h-9 rounded-xl text-sm font-bold transition-colors ${
                        p === page ? "bg-blue-600 text-white shadow-md" : "border border-slate-200 text-slate-600 hover:border-blue-300 hover:text-blue-600"
                      }`}
                    >
                      {p}
                    </button>
                  ))}
                <button
                  onClick={() => setPage((p) => Math.min(result.totalPages, p + 1))}
                  disabled={page >= result.totalPages}
                  className="w-9 h-9 rounded-xl border border-slate-200 flex items-center justify-center text-slate-400 hover:border-blue-300 hover:text-blue-600 transition-colors disabled:opacity-40"
                >
                  <ArrowRight size={14} />
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function SearchPage() {
  return (
    <Suspense fallback={<Spinner />}>
      <SearchPageInner />
    </Suspense>
  );
}
