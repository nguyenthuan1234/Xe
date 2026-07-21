"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { CheckCircle, BarChart2, Plus, Mail, Phone, Lock, AlertCircle } from "lucide-react";
import Header from "@/components/Header";
import CarCard from "@/components/CarCard";
import { Field, Btn, Spinner, ErrorNotice } from "@/components/ui";
import { fetchMyCars, type ApiCar } from "@/lib/api-cars";
import { fetchMyFavorites, updateMyProfile, changeMyPassword } from "@/lib/api-users";
import { ApiError } from "@/lib/api";
import { useAuth } from "@/lib/auth";

export default function ProfilePage() {
  const router = useRouter();
  const { user, isLoading: authLoading, refreshMe } = useAuth();
  const [tab, setTab] = useState("info");

  useEffect(() => {
    if (!authLoading && !user) router.push("/login");
  }, [authLoading, user, router]);

  // ── Thông tin cá nhân ────────────────────────────────────────────────
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [province, setProvince] = useState("");
  const [savingInfo, setSavingInfo] = useState(false);
  const [infoMessage, setInfoMessage] = useState("");
  const [infoError, setInfoError] = useState("");

  useEffect(() => {
    if (user) {
      setName(user.name);
      setPhone(user.phone);
    }
  }, [user]);

  const handleSaveInfo = async () => {
    setSavingInfo(true);
    setInfoError("");
    setInfoMessage("");
    try {
      await updateMyProfile({ name, phone, province });
      await refreshMe();
      setInfoMessage("Đã lưu thay đổi.");
    } catch (err) {
      setInfoError(err instanceof ApiError ? err.message : "Cập nhật thất bại.");
    } finally {
      setSavingInfo(false);
    }
  };

  // ── Đổi mật khẩu ─────────────────────────────────────────────────────
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmNewPassword, setConfirmNewPassword] = useState("");
  const [savingPassword, setSavingPassword] = useState(false);
  const [passwordMessage, setPasswordMessage] = useState("");
  const [passwordError, setPasswordError] = useState("");

  const handleChangePassword = async () => {
    if (newPassword !== confirmNewPassword) {
      setPasswordError("Mật khẩu xác nhận không khớp.");
      return;
    }
    setSavingPassword(true);
    setPasswordError("");
    setPasswordMessage("");
    try {
      await changeMyPassword({ currentPassword, newPassword });
      setPasswordMessage("Đổi mật khẩu thành công.");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmNewPassword("");
    } catch (err) {
      setPasswordError(err instanceof ApiError ? err.message : "Đổi mật khẩu thất bại.");
    } finally {
      setSavingPassword(false);
    }
  };

  // ── Tin đã đăng / Yêu thích ──────────────────────────────────────────
  const [listings, setListings] = useState<ApiCar[]>([]);
  const [favorites, setFavorites] = useState<ApiCar[]>([]);
  const [loadingTab, setLoadingTab] = useState(false);
  const [tabError, setTabError] = useState("");

  const loadListings = useCallback(async () => {
    setLoadingTab(true);
    setTabError("");
    try {
      const res = await fetchMyCars({ limit: 20 });
      setListings(res.items);
    } catch (err) {
      setTabError(err instanceof ApiError ? err.message : "Không tải được tin đăng.");
    } finally {
      setLoadingTab(false);
    }
  }, []);

  const loadFavorites = useCallback(async () => {
    setLoadingTab(true);
    setTabError("");
    try {
      setFavorites(await fetchMyFavorites());
    } catch (err) {
      setTabError(err instanceof ApiError ? err.message : "Không tải được danh sách yêu thích.");
    } finally {
      setLoadingTab(false);
    }
  }, []);

  useEffect(() => {
    if (!user) return;
    if (tab === "listings") loadListings();
    if (tab === "favorites") loadFavorites();
  }, [tab, user, loadListings, loadFavorites]);

  const tabs = [
    { id: "info", label: "Thông tin cá nhân" },
    { id: "password", label: "Đổi mật khẩu" },
    { id: "listings", label: "Tin đã đăng" },
    { id: "favorites", label: "Tin yêu thích" },
  ];

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
      <div className="max-w-4xl mx-auto px-4 sm:px-6 pt-24 pb-14">
        {/* Profile header */}
        <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden mb-6">
          {/* Cover Image */}
          <div className="h-28 bg-gradient-to-r from-blue-600 to-blue-800 relative">
            <div className="absolute inset-0 opacity-20">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?w=800&h=200&fit=crop&auto=format" alt="" className="w-full h-full object-cover" />
            </div>
          </div>

          <div className="px-6 pb-5 relative">
            <div className="flex items-end gap-4 -mt-10 mb-4">
              {/* Avatar */}
              <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-blue-400 to-blue-700 flex items-center justify-center font-black text-white text-3xl shadow-xl border-4 border-white shrink-0">
                {user.name[0]?.toUpperCase()}
              </div>
              {/* Name & Email */}
              <div className="pb-1 min-w-0">
                <h2 className="text-xl font-black text-slate-900 truncate">{user.name}</h2>
                <p className="text-slate-500 text-sm flex items-center gap-1.5 truncate">
                  {user.role === "admin" ? (
                    <>
                      <CheckCircle size={13} className="text-emerald-500" /> Quản trị viên
                    </>
                  ) : (
                    user.email
                  )}
                </p>
              </div>
              {/* Buttons */}
              <div className="ml-auto pb-1 flex gap-2 shrink-0">
                {user.role === "admin" ? (
                  <Btn variant="secondary" size="sm" onClick={() => router.push("/admin")}>
                    <BarChart2 size={13} /> Admin
                  </Btn>
                ) : (
                  <Btn variant="secondary" size="sm" onClick={() => router.push("/seller")}>
                    <BarChart2 size={13} /> Dashboard
                  </Btn>
                )}
                <Btn size="sm" onClick={() => router.push("/post-car")}>
                  <Plus size={13} /> Đăng tin
                </Btn>
              </div>
            </div>
          </div>
        </div>

        {/* Tab bar */}
        <div className="flex gap-1 bg-white rounded-xl border border-slate-100 shadow-sm p-1.5 mb-5 overflow-x-auto">
          {tabs.map(({ id, label }) => (
            <button
              key={id}
              onClick={() => setTab(id)}
              className={`whitespace-nowrap px-4 py-2 rounded-lg text-sm font-bold transition-all ${tab === id ? "bg-blue-600 text-white shadow-md" : "text-slate-500 hover:text-slate-800"
                }`}
            >
              {label}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
          {tab === "info" && (
            <div className="space-y-4 max-w-lg">
              <div className="grid grid-cols-2 gap-4">
                <Field label="Họ và tên" value={name} onChange={(e) => setName(e.target.value)} />
                <Field label="Email" value={user.email} icon={<Mail size={14} />} onChange={() => undefined} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <Field label="Số điện thoại" value={phone} onChange={(e) => setPhone(e.target.value)} icon={<Phone size={14} />} />
                <Field label="Tỉnh/Thành phố" placeholder="Hà Nội, TP.HCM..." value={province} onChange={(e) => setProvince(e.target.value)} />
              </div>
              {infoError && (
                <p className="flex items-center gap-1.5 text-xs text-red-600 font-medium">
                  <AlertCircle size={13} /> {infoError}
                </p>
              )}
              {infoMessage && <p className="text-xs text-emerald-600 font-medium">{infoMessage}</p>}
              <div className="flex items-center gap-3 pt-2">
                <Btn onClick={handleSaveInfo} disabled={savingInfo}>
                  {savingInfo ? "Đang lưu..." : "Lưu thay đổi"}
                </Btn>
              </div>
            </div>
          )}

          {tab === "password" && (
            <div className="space-y-4 max-w-sm">
              <Field label="Mật khẩu hiện tại" type="password" placeholder="••••••••" icon={<Lock size={14} />} value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} />
              <Field label="Mật khẩu mới" type="password" placeholder="Tối thiểu 8 ký tự" icon={<Lock size={14} />} value={newPassword} onChange={(e) => setNewPassword(e.target.value)} />
              <Field label="Xác nhận mật khẩu mới" type="password" placeholder="••••••••" icon={<Lock size={14} />} value={confirmNewPassword} onChange={(e) => setConfirmNewPassword(e.target.value)} />
              {passwordError && (
                <p className="flex items-center gap-1.5 text-xs text-red-600 font-medium">
                  <AlertCircle size={13} /> {passwordError}
                </p>
              )}
              {passwordMessage && <p className="text-xs text-emerald-600 font-medium">{passwordMessage}</p>}
              <Btn onClick={handleChangePassword} disabled={savingPassword}>
                {savingPassword ? "Đang xử lý..." : "Đổi mật khẩu"}
              </Btn>
            </div>
          )}

          {tab === "listings" &&
            (loadingTab ? (
              <Spinner />
            ) : tabError ? (
              <ErrorNotice message={tabError} onRetry={loadListings} />
            ) : listings.length === 0 ? (
              <p className="text-sm text-slate-500 text-center py-8">Bạn chưa có tin đăng nào.</p>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {listings.map((car) => (
                  <CarCard key={car._id} car={car} onClick={() => router.push(`/car/${car._id}`)} />
                ))}
              </div>
            ))}

          {tab === "favorites" &&
            (loadingTab ? (
              <Spinner />
            ) : tabError ? (
              <ErrorNotice message={tabError} onRetry={loadFavorites} />
            ) : favorites.length === 0 ? (
              <p className="text-sm text-slate-500 text-center py-8">Bạn chưa yêu thích xe nào.</p>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {favorites.map((car) => (
                  <CarCard key={car._id} car={car} onClick={() => router.push(`/car/${car._id}`)} />
                ))}
              </div>
            ))}
        </div>
      </div>
    </div>
  );
}
