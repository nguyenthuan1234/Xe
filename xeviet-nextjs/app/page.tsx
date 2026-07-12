"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { CheckCircle, Search, ChevronRight, Award, ArrowRight, Car, FileText, Users, MapPin } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import CarCard from "@/components/CarCard";
import { Dropdown, Btn, Spinner, ErrorNotice } from "@/components/ui";
import { fetchCars, type ApiCar } from "@/lib/api-cars";
import { fetchCategories, type ApiCategory } from "@/lib/api-categories";
import { ApiError, toAbsoluteUrl } from "@/lib/api";

export default function HomePage() {
  const router = useRouter();
  const [cars, setCars] = useState<ApiCar[]>([]);
  const [brands, setBrands] = useState<ApiCategory[]>([]);
  const [carTypes, setCarTypes] = useState<ApiCategory[]>([]);
  const [locations, setLocations] = useState<ApiCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [keyword, setKeyword] = useState("");

  const loadData = async () => {
    setLoading(true);
    setError("");
    try {
      const [carsRes, brandsRes, typesRes, locationsRes] = await Promise.all([
        fetchCars({ sort: "newest", limit: 6 }),
        fetchCategories("brand"),
        fetchCategories("carType"),
        fetchCategories("location"),
      ]);
      setCars(carsRes.items);
      setBrands(brandsRes);
      setCarTypes(typesRes);
      setLocations(locationsRes);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Không tải được dữ liệu từ máy chủ.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSearch = () => {
    router.push(keyword ? `/search?search=${encodeURIComponent(keyword)}` : "/search");
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div>
        {/* Hero */}
        <section className="relative min-h-[640px] flex items-center overflow-hidden">
          <div className="absolute inset-0">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?w=1600&h=700&fit=crop&auto=format"
              alt="Xe hơi sang trọng"
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-slate-950/90 via-blue-950/75 to-blue-900/20" />
          </div>
          <div className="relative max-w-7xl mx-auto px-4 sm:px-6 w-full pt-16">
            <motion.div
              initial={{ opacity: 0, y: 32 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.65, ease: "easeOut" }}
              className="max-w-2xl"
            >
              <div className="flex items-center gap-2 mb-5">
                <span className="bg-blue-500/25 text-blue-200 text-xs font-bold px-3.5 py-1.5 rounded-full border border-blue-400/30 backdrop-blur-sm">
                  #1 Sàn giao dịch xe cũ Việt Nam
                </span>
              </div>
              <h1 className="text-4xl md:text-[3.25rem] font-black text-white leading-[1.1] mb-5">
                Tìm Xe Cũ Ưng Ý
                <br />
                <span className="text-blue-400">Giá Tốt Nhất</span> Toàn Quốc
              </h1>
              <p className="text-slate-300 text-base mb-8 leading-relaxed max-w-lg">
                Hàng nghìn xe cũ được đăng bán mỗi ngày từ các thương hiệu hàng đầu. Giao dịch an toàn, minh bạch, có kiểm duyệt.
              </p>
              <div className="flex flex-wrap items-center gap-5 text-sm text-white/80">
                {["Tin đăng được kiểm duyệt", "Người bán xác thực OTP", "Kết nối trực tiếp không qua trung gian"].map((t) => (
                  <span key={t} className="flex items-center gap-2">
                    <CheckCircle size={15} className="text-blue-400" /> {t}
                  </span>
                ))}
              </div>
            </motion.div>
          </div>
        </section>

        {/* Search Box */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 -mt-10 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55, delay: 0.2 }}
            className="bg-white rounded-3xl shadow-2xl shadow-blue-900/15 border border-blue-50 p-6"
          >
            <div className="flex items-center gap-4 mb-5 border-b border-slate-100 pb-4">
              {["Mua xe cũ", "Bán xe", "Định giá xe"].map((t, i) => (
                <button
                  key={t}
                  className={`text-sm font-bold pb-0.5 transition-colors ${
                    i === 0 ? "text-blue-600 border-b-2 border-blue-600" : "text-slate-400 hover:text-slate-700"
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
              <Dropdown placeholder="Tất cả hãng xe" options={brands.map((b) => b.name)} />
              <Dropdown placeholder="Tất cả dòng xe" options={carTypes.map((t) => t.name)} />
              <Dropdown
                placeholder="Khoảng giá"
                options={["Dưới 300 triệu", "300 – 500 triệu", "500 – 800 triệu", "800tr – 1 tỷ", "Trên 1 tỷ"]}
              />
              <Dropdown placeholder="Toàn quốc" options={locations.map((l) => l.name)} />
            </div>
            <div className="flex gap-3">
              <div className="flex-1 relative">
                <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  value={keyword}
                  onChange={(e) => setKeyword(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                  placeholder="Nhập tên xe, hãng, mẫu..."
                  className="w-full bg-slate-50 border border-slate-200 rounded-2xl py-3.5 pl-10 pr-4 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all"
                />
              </div>
              <Btn size="lg" onClick={handleSearch}>
                <Search size={16} /> Tìm kiếm
              </Btn>
            </div>
          </motion.div>
        </section>

        {error && (
          <section className="max-w-7xl mx-auto px-4 sm:px-6 mt-8">
            <ErrorNotice message={error} onRetry={loadData} />
          </section>
        )}

        {/* Brand Grid */}
        {brands.length > 0 && (
          <section className="max-w-7xl mx-auto px-4 sm:px-6 mt-14">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-xl font-black text-slate-900">Tìm theo hãng xe</h2>
                <p className="text-slate-500 text-sm mt-0.5">Khám phá xe theo thương hiệu yêu thích</p>
              </div>
              <Link href="/search" className="text-sm text-blue-600 font-bold flex items-center gap-1 hover:gap-2 transition-all">
                Tất cả hãng <ChevronRight size={15} />
              </Link>
            </div>
            <div className="grid grid-cols-5 md:grid-cols-10 gap-3">
              {brands.map((b, i) => (
                <motion.button
                  key={b._id}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.04 }}
                  whileHover={{ scale: 1.06 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={() => router.push(`/search?brand=${encodeURIComponent(b.name)}`)}
                  className="flex flex-col items-center gap-2 p-3 rounded-2xl bg-white border border-slate-100 hover:border-blue-200 hover:shadow-lg hover:shadow-blue-500/10 transition-all group"
                >
                  {b.imageUrl ? (
                    <div className="w-10 h-10 rounded-full overflow-hidden bg-white border border-slate-100 shadow-md flex-shrink-0">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={toAbsoluteUrl(b.imageUrl)} alt={b.name} className="w-full h-full object-contain p-1" />
                    </div>
                  ) : (
                    <div
                      className="w-10 h-10 rounded-full flex items-center justify-center font-black text-white text-sm shadow-md"
                      style={{ backgroundColor: b.colorHex || "#2563eb" }}
                    >
                      {b.name[0]}
                    </div>
                  )}
                  <span className="text-[11px] font-bold text-slate-700 group-hover:text-blue-600 transition-colors">{b.name}</span>
                </motion.button>
              ))}
            </div>
          </section>
        )}

        {/* Cars */}
        {loading ? (
          <Spinner />
        ) : (
          <>
            {cars.length > 0 && (
              <section className="max-w-7xl mx-auto px-4 sm:px-6 mt-14">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h2 className="text-xl font-black text-slate-900">Xe mới đăng</h2>
                    <p className="text-slate-500 text-sm mt-0.5">Cập nhật liên tục, đã qua kiểm duyệt</p>
                  </div>
                  <Link href="/search">
                    <Btn variant="secondary" size="sm">
                      Xem tất cả <ChevronRight size={13} />
                    </Btn>
                  </Link>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-5">
                  {cars.map((car) => (
                    <CarCard key={car._id} car={car} onClick={() => router.push(`/car/${car._id}`)} />
                  ))}
                </div>
              </section>
            )}

            {!error && cars.length === 0 && (
              <section className="max-w-7xl mx-auto px-4 sm:px-6 mt-14 text-center py-10">
                <p className="text-slate-500 text-sm">
                  Chưa có tin đăng nào được duyệt. Hãy chạy <code className="bg-slate-100 px-1.5 py-0.5 rounded">npm run seed</code> ở
                  backend hoặc đăng tin mới!
                </p>
              </section>
            )}
          </>
        )}

        {/* Ad Banner */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 mt-14">
          <div className="relative rounded-3xl overflow-hidden bg-gradient-to-br from-blue-600 to-blue-800 p-8 md:p-10">
            <div className="absolute inset-0 opacity-15">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=1400&h=400&fit=crop&auto=format"
                alt=""
                className="w-full h-full object-cover"
              />
            </div>
            <div className="absolute top-0 right-0 w-96 h-96 bg-blue-500/20 rounded-full -translate-y-1/2 translate-x-1/3" />
            <div className="relative flex flex-col md:flex-row items-center justify-between gap-6">
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <Award size={18} className="text-blue-300" />
                  <span className="text-blue-200 text-sm font-semibold">Ưu đãi đặc biệt tháng này</span>
                </div>
                <h3 className="text-white text-2xl md:text-3xl font-black mb-2">Đăng tin miễn phí ngay!</h3>
                <p className="text-blue-200 text-sm">Tiếp cận hàng nghìn người mua tiềm năng. Không cần thẻ tín dụng.</p>
              </div>
              <Btn size="lg" className="bg-white! text-blue-700! hover:bg-blue-50! shadow-none! whitespace-nowrap" onClick={() => router.push("/post-car")}>
                Đăng tin ngay <ArrowRight size={16} />
              </Btn>
            </div>
          </div>
        </section>

        {/* Platform Stats */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 mt-16">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { v: brands.length.toString(), l: "Thương hiệu", icon: Car, bg: "bg-blue-50", fg: "text-blue-600" },
              { v: cars.length.toString() + "+", l: "Tin đăng gần đây", icon: FileText, bg: "bg-emerald-50", fg: "text-emerald-600" },
              { v: "An toàn", l: "Xác thực OTP", icon: Users, bg: "bg-violet-50", fg: "text-violet-600" },
              { v: locations.length.toString(), l: "Khu vực", icon: MapPin, bg: "bg-amber-50", fg: "text-amber-600" },
            ].map(({ v, l, icon: Icon, bg, fg }) => (
              <div key={l} className="bg-white rounded-2xl border border-slate-100 p-5 flex items-center gap-4 hover:shadow-lg hover:shadow-blue-500/5 transition-shadow">
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${bg}`}>
                  <Icon size={22} className={fg} />
                </div>
                <div>
                  <p className="text-2xl font-black text-slate-900">{v}</p>
                  <p className="text-xs text-slate-500 mt-0.5">{l}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        <Footer />
      </div>
    </div>
  );
}
