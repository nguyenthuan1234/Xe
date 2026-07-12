"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Check, ArrowLeft, ArrowRight, CheckCircle, Gauge, Tag, Plus, X, User, Phone, AlertCircle } from "lucide-react";
import Header from "@/components/Header";
import { Field, Dropdown, Btn, Spinner } from "@/components/ui";
import { fetchCategories, type ApiCategory } from "@/lib/api-categories";
import { createCar } from "@/lib/api-cars";
import { uploadImages } from "@/lib/api-uploads";
import { ApiError } from "@/lib/api";
import { useAuth } from "@/lib/auth";

const YEARS = Array.from({ length: 15 }, (_, i) => String(2025 - i));
const FUELS = ["Xăng", "Dầu", "Hybrid", "Điện"];
const TRANSMISSIONS = ["Tự động", "Số sàn", "Bán tự động"];

export default function PostCarPage() {
  const router = useRouter();
  const { user, isLoading: authLoading } = useAuth();

  const [step, setStep] = useState(1);
  const total = 3;
  const labels = ["Thông tin xe", "Hình ảnh", "Liên hệ & Xem trước"];

  const [brands, setBrands] = useState<ApiCategory[]>([]);
  const [types, setTypes] = useState<ApiCategory[]>([]);
  const [locations, setLocations] = useState<ApiCategory[]>([]);

  // Step 1 fields
  const [brand, setBrand] = useState("");
  const [carType, setCarType] = useState("");
  const [year, setYear] = useState("");
  const [km, setKm] = useState("");
  const [price, setPrice] = useState("");
  const [transmission, setTransmission] = useState("");
  const [fuel, setFuel] = useState("");
  const [location, setLocation] = useState("");
  const [nameSuffix, setNameSuffix] = useState("");
  const [description, setDescription] = useState("");

  // Step 2
  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const [uploading, setUploading] = useState(false);

  // Step 3
  const [sellerPhone, setSellerPhone] = useState("");

  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!authLoading && !user) router.push("/login");
  }, [authLoading, user, router]);

  useEffect(() => {
    Promise.all([fetchCategories("brand"), fetchCategories("carType"), fetchCategories("location")])
      .then(([b, t, l]) => {
        setBrands(b);
        setTypes(t);
        setLocations(l);
      })
      .catch(() => undefined);
  }, []);

  useEffect(() => {
    if (user?.phone) setSellerPhone(user.phone);
  }, [user]);

  const carName = `${brand || "Xe"} ${nameSuffix}`.trim();

  const handleFilesSelected = (files: FileList | null) => {
    if (!files) return;
    const arr = Array.from(files).slice(0, 20 - imageFiles.length);
    setImageFiles((prev) => [...prev, ...arr]);
    arr.forEach((f) => {
      const reader = new FileReader();
      reader.onload = () => setImagePreviews((prev) => [...prev, reader.result as string]);
      reader.readAsDataURL(f);
    });
  };

  const removeImageAt = (idx: number) => {
    setImageFiles((prev) => prev.filter((_, i) => i !== idx));
    setImagePreviews((prev) => prev.filter((_, i) => i !== idx));
  };

  const validateStep1 = () => {
    if (!brand || !carType || !year || !km || !price || !transmission || !fuel || !location) {
      setError("Vui lòng điền đầy đủ các trường bắt buộc (*).");
      return false;
    }
    setError("");
    return true;
  };

  const goNext = () => {
    if (step === 1 && !validateStep1()) return;
    setError("");
    setStep((s) => Math.min(total, s + 1));
  };

  const handleSubmit = async () => {
    if (!sellerPhone) {
      setError("Vui lòng nhập số điện thoại liên hệ.");
      return;
    }
    setSubmitting(true);
    setError("");
    try {
      let imageUrls: string[] = [];
      if (imageFiles.length > 0) {
        setUploading(true);
        imageUrls = await uploadImages(imageFiles);
        setUploading(false);
      }

      await createCar({
        name: carName || "Xe chưa đặt tên",
        price: Number(price),
        year: Number(year),
        km: Number(km),
        fuel,
        transmission,
        location,
        brand,
        type: carType,
        images: imageUrls,
        description,
        sellerPhone,
      });

      router.push("/seller");
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Đăng tin thất bại. Vui lòng thử lại.");
    } finally {
      setSubmitting(false);
      setUploading(false);
    }
  };

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
      <div className="max-w-3xl mx-auto px-4 sm:px-6 pt-24 pb-14">
        <div className="mb-8">
          <h1 className="text-2xl font-black text-slate-900">Đăng tin bán xe</h1>
          <p className="text-slate-500 text-sm mt-1">Hoàn thành {total} bước — tin đăng sẽ được admin duyệt trước khi hiển thị công khai</p>
        </div>

        {/* Stepper */}
        <div className="flex items-center mb-8">
          {labels.map((l, i) => (
            <div key={l} className="flex items-center flex-1">
              <div className="flex flex-col items-center gap-1.5">
                <div
                  className={`w-9 h-9 rounded-full flex items-center justify-center font-black text-sm transition-all ${
                    i + 1 === step
                      ? "bg-blue-600 text-white shadow-lg shadow-blue-500/30"
                      : i + 1 < step
                      ? "bg-emerald-500 text-white"
                      : "bg-slate-100 text-slate-400"
                  }`}
                >
                  {i + 1 < step ? <Check size={15} /> : i + 1}
                </div>
                <span
                  className={`text-[11px] hidden sm:block font-semibold ${
                    i + 1 === step ? "text-blue-600" : i + 1 < step ? "text-emerald-600" : "text-slate-400"
                  }`}
                >
                  {l}
                </span>
              </div>
              {i < labels.length - 1 && (
                <div className={`flex-1 h-0.5 mx-2 mt-[-18px] transition-colors ${i + 1 < step ? "bg-emerald-400" : "bg-slate-200"}`} />
              )}
            </div>
          ))}
        </div>

        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
          {step === 1 && (
            <div className="space-y-4">
              <h2 className="font-black text-slate-900 mb-2">Thông tin cơ bản</h2>
              <div className="grid grid-cols-2 gap-4">
                <Dropdown label="Hãng xe *" placeholder="Chọn hãng xe" options={brands.map((b) => b.name)} value={brand} onChange={setBrand} />
                <Dropdown label="Loại xe *" placeholder="Chọn loại xe" options={types.map((t) => t.name)} value={carType} onChange={setCarType} />
              </div>
              <Field label="Tên/phiên bản xe (vd: Camry 2.5Q)" placeholder="Nhập tên hoặc phiên bản" value={nameSuffix} onChange={(e) => setNameSuffix(e.target.value)} />
              <div className="grid grid-cols-2 gap-4">
                <Dropdown label="Năm sản xuất *" placeholder="Năm SX" options={YEARS} value={year} onChange={setYear} />
                <Field label="Số km đã đi *" placeholder="Ví dụ: 28500" icon={<Gauge size={14} />} value={km} onChange={(e) => setKm(e.target.value.replace(/\D/g, ""))} />
              </div>
              <Field label="Giá bán (₫) *" placeholder="Ví dụ: 1185000000" icon={<Tag size={14} />} value={price} onChange={(e) => setPrice(e.target.value.replace(/\D/g, ""))} />
              <div className="grid grid-cols-2 gap-4">
                <Dropdown label="Hộp số *" placeholder="Chọn hộp số" options={TRANSMISSIONS} value={transmission} onChange={setTransmission} />
                <Dropdown label="Nhiên liệu *" placeholder="Chọn nhiên liệu" options={FUELS} value={fuel} onChange={setFuel} />
              </div>
              <Dropdown label="Khu vực *" placeholder="Chọn tỉnh/thành" options={locations.map((l) => l.name)} value={location} onChange={setLocation} />
              <div>
                <label className="text-sm font-semibold text-slate-700 block mb-1.5">Mô tả xe</label>
                <textarea
                  rows={4}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Mô tả tình trạng xe, lịch sử sử dụng, phụ kiện đi kèm, lý do bán..."
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 px-4 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 resize-none transition-all"
                />
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-6">
              <div>
                <h2 className="font-black text-slate-900 mb-1">Hình ảnh xe</h2>
                <p className="text-slate-500 text-xs mb-4">Tải lên tối đa 20 ảnh (JPG, PNG, WEBP). Ảnh đầu tiên làm ảnh đại diện.</p>
                <div className="grid grid-cols-3 sm:grid-cols-5 gap-3">
                  {imagePreviews.map((src, i) => (
                    <div key={i} className="aspect-square rounded-xl overflow-hidden relative group">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={src} alt="" className="w-full h-full object-cover" />
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <button onClick={() => removeImageAt(i)} className="bg-red-500 text-white w-7 h-7 rounded-full flex items-center justify-center shadow-md">
                          <X size={12} />
                        </button>
                      </div>
                      {i === 0 && (
                        <span className="absolute top-1.5 left-1.5 bg-blue-600 text-white text-[9px] font-black px-2 py-0.5 rounded-lg">
                          Đại diện
                        </span>
                      )}
                    </div>
                  ))}
                  {imageFiles.length < 20 && (
                    <label className="aspect-square rounded-xl border-2 border-dashed border-slate-300 flex flex-col items-center justify-center gap-2 hover:border-blue-400 hover:bg-blue-50/50 transition-all cursor-pointer group">
                      <input type="file" accept="image/*" multiple className="hidden" onChange={(e) => handleFilesSelected(e.target.files)} />
                      <Plus size={22} className="text-slate-300 group-hover:text-blue-500 transition-colors" />
                      <span className="text-[11px] text-slate-400 group-hover:text-blue-500">Thêm ảnh</span>
                    </label>
                  )}
                </div>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-4">
              <h2 className="font-black text-slate-900 mb-4">Thông tin liên hệ</h2>
              <div className="flex items-center gap-2.5 text-sm text-slate-500 bg-slate-50 rounded-xl px-3.5 py-2.5">
                <User size={14} className="text-blue-500" /> {user.name} ({user.email})
              </div>
              <Field label="Số điện thoại liên hệ *" placeholder="0912 345 678" type="tel" icon={<Phone size={14} />} value={sellerPhone} onChange={(e) => setSellerPhone(e.target.value)} />

              <div className="border-t border-slate-100 pt-5 mt-2">
                <h2 className="font-black text-slate-900 mb-3">Xem trước tin đăng</h2>
                <div className="rounded-2xl border border-slate-100 overflow-hidden max-w-xs">
                  <div className="h-40 bg-slate-100">
                    {imagePreviews[0] ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={imagePreviews[0]} alt="" className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-slate-300 text-xs">Chưa có ảnh</div>
                    )}
                  </div>
                  <div className="p-4">
                    <p className="font-bold text-slate-900 text-sm mb-1">{carName || "Tên xe"}</p>
                    <p className="text-blue-600 font-black">{price ? `${Number(price).toLocaleString("vi-VN")} ₫` : "—"}</p>
                    <p className="text-xs text-slate-400 mt-1">
                      {year} · {km ? `${Number(km).toLocaleString("vi-VN")} km` : "—"} · {location || "—"}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {error && (
            <p className="flex items-center gap-1.5 text-xs text-red-600 font-medium mt-4">
              <AlertCircle size={13} /> {error}
            </p>
          )}
        </div>

        <div className="flex justify-between mt-5">
          <Btn variant="ghost" onClick={() => (step > 1 ? setStep((s) => s - 1) : router.push("/"))} disabled={submitting}>
            <ArrowLeft size={15} /> {step > 1 ? "Bước trước" : "Hủy"}
          </Btn>
          <Btn onClick={() => (step < total ? goNext() : handleSubmit())} disabled={submitting}>
            {submitting ? (uploading ? "Đang tải ảnh..." : "Đang đăng tin...") : step === total ? (
              <>
                <CheckCircle size={15} /> Đăng tin ngay
              </>
            ) : (
              <>
                Tiếp theo <ArrowRight size={15} />
              </>
            )}
          </Btn>
        </div>
      </div>
    </div>
  );
}
