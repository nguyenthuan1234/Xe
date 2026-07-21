"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import AdminCarsManagement from "@/components/admin/AdminCarsManagement";
import {
  Shield,
  LogOut,
  Users,
  Clock,
  CheckCircle,
  Tag,
  Search,
  Plus,
  Eye,
  XCircle,
  Lock,
  Unlock,
  Trash2,
  FileText,
} from "lucide-react";
import Header from "@/components/Header";
import { Chip, Btn, Field, Spinner, ErrorNotice } from "@/components/ui";
import {
  fetchPendingCars,
  approveCar,
  rejectCar,
  type ApiCar,
} from "@/lib/api-cars";
import {
  fetchUsersAdmin,
  updateUserAdmin,
  deleteUserAdmin,
  type ApiUser,
} from "@/lib/api-users";
import {
  fetchCategories,
  createCategory,
  updateCategory,
  deleteCategory,
  type ApiCategory,
  type CategoryGroup,
} from "@/lib/api-categories";
import { uploadImage } from "@/lib/api-uploads";
import { formatVND, formatRelativeTime } from "@/lib/format";
import { toAbsoluteUrl, ApiError } from "@/lib/api";
import { useAuth } from "@/lib/auth";

const CATEGORY_GROUPS: { group: CategoryGroup; title: string }[] = [
  { group: "brand", title: "Hãng xe" },
  { group: "carType", title: "Loại xe" },
  { group: "model", title: "Dòng xe phổ biến" },
  { group: "location", title: "Khu vực" },
];

export default function AdminDashboardPage() {
  const router = useRouter();
  const { user, isLoading: authLoading, logout } = useAuth();
  const [tab, setTab] = useState("approvals");

  useEffect(() => {
    if (!authLoading && (!user || user.role !== "admin")) {
      router.replace("/login");
    }
  }, [authLoading, user, router]);

  // ── Duyệt tin ────────────────────────────────────────────────────────
  const [pendingCars, setPendingCars] = useState<ApiCar[]>([]);
  const [loadingCars, setLoadingCars] = useState(true);
  const [carsError, setCarsError] = useState("");

  const loadPending = useCallback(async () => {
    setLoadingCars(true);
    setCarsError("");
    try {
      const res = await fetchPendingCars({ limit: 50 });
      setPendingCars(res.items);
    } catch (err) {
      setCarsError(
        err instanceof ApiError
          ? err.message
          : "Không tải được danh sách tin chờ duyệt.",
      );
    } finally {
      setLoadingCars(false);
    }
  }, []);

  const handleApprove = async (id: string) => {
    try {
      await approveCar(id);
      setPendingCars((prev) => prev.filter((c) => c._id !== id));
    } catch (err) {
      alert(err instanceof ApiError ? err.message : "Duyệt tin thất bại.");
    }
  };

  const handleReject = async (id: string) => {
    if (!confirm("Từ chối tin đăng này?")) return;
    try {
      await rejectCar(id);
      setPendingCars((prev) => prev.filter((c) => c._id !== id));
    } catch (err) {
      alert(err instanceof ApiError ? err.message : "Từ chối tin thất bại.");
    }
  };

  // ── Quản lý tài khoản ────────────────────────────────────────────────
  const [users, setUsers] = useState<ApiUser[]>([]);
  const [loadingUsers, setLoadingUsers] = useState(true);
  const [usersError, setUsersError] = useState("");
  const [userSearch, setUserSearch] = useState("");

  const loadUsers = useCallback(async (search?: string) => {
    setLoadingUsers(true);
    setUsersError("");
    try {
      const res = await fetchUsersAdmin({
        limit: 50,
        search: search || undefined,
      });
      setUsers(res.items);
    } catch (err) {
      setUsersError(
        err instanceof ApiError
          ? err.message
          : "Không tải được danh sách tài khoản.",
      );
    } finally {
      setLoadingUsers(false);
    }
  }, []);

  const handleToggleLock = async (u: ApiUser) => {
    try {
      const updated = await updateUserAdmin(u._id, {
        status: u.status === "active" ? "locked" : "active",
      });
      setUsers((prev) => prev.map((x) => (x._id === u._id ? updated : x)));
    } catch (err) {
      alert(err instanceof ApiError ? err.message : "Cập nhật thất bại.");
    }
  };

  const handleDeleteUser = async (id: string) => {
    if (
      !confirm(
        "Xóa tài khoản này? Toàn bộ bài đăng của họ cũng sẽ bị xóa. Hành động không thể hoàn tác.",
      )
    )
      return;
    try {
      const res = await deleteUserAdmin(id);
      setUsers((prev) => prev.filter((x) => x._id !== id));
      if (res?.message) alert(res.message); // hiện "Đã xóa tài khoản và 3 bài đăng liên quan."
    } catch (err) {
      alert(err instanceof ApiError ? err.message : "Xóa tài khoản thất bại.");
    }
  };

  // ── Danh mục ─────────────────────────────────────────────────────────
  const [categories, setCategories] = useState<ApiCategory[]>([]);
  const [loadingCategories, setLoadingCategories] = useState(true);
  const [newCategoryName, setNewCategoryName] = useState<
    Record<CategoryGroup, string>
  >({
    brand: "",
    carType: "",
    model: "",
    location: "",
  });

  const loadCategories = useCallback(async () => {
    setLoadingCategories(true);
    try {
      setCategories(await fetchCategories());
    } catch {
      // im lặng — tab danh mục không chặn các tab khác
    } finally {
      setLoadingCategories(false);
    }
  }, []);

  const handleAddCategory = async (group: CategoryGroup) => {
    const name = newCategoryName[group].trim();
    if (!name) return;
    try {
      const created = await createCategory({ name, group });
      setCategories((prev) => [...prev, created]);
      setNewCategoryName((prev) => ({ ...prev, [group]: "" }));
    } catch (err) {
      alert(err instanceof ApiError ? err.message : "Thêm danh mục thất bại.");
    }
  };

  const handleDeleteCategory = async (id: string) => {
    try {
      await deleteCategory(id);
      setCategories((prev) => prev.filter((c) => c._id !== id));
    } catch (err) {
      alert(err instanceof ApiError ? err.message : "Xóa danh mục thất bại.");
    }
  };

  const [uploadingImageId, setUploadingImageId] = useState<string | null>(null);

  const handleUploadBrandImage = async (categoryId: string, file: File) => {
    setUploadingImageId(categoryId);
    try {
      const url = await uploadImage(file);
      const updated = await updateCategory(categoryId, { imageUrl: url });
      setCategories((prev) =>
        prev.map((c) => (c._id === categoryId ? updated : c)),
      );
    } catch (err) {
      alert(err instanceof ApiError ? err.message : "Tải ảnh lên thất bại.");
    } finally {
      setUploadingImageId(null);
    }
  };

  useEffect(() => {
    if (!user || user.role !== "admin") return;
    if (tab === "approvals") loadPending();
    if (tab === "users") loadUsers();
    if (tab === "categories") loadCategories();
  }, [tab, user, loadPending, loadUsers, loadCategories]);

  const tabs = [
    { id: "approvals", label: "Phê duyệt bài đăng", icon: CheckCircle },
    { id: "manageCars", label: "Quản lý bài đăng", icon: FileText },
    { id: "users", label: "Quản lý tài khoản", icon: Users },
    { id: "categories", label: "Danh mục", icon: Tag },
  ];

  if (authLoading || !user || user.role !== "admin") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <p className="text-sm text-slate-500">
          Đang kiểm tra quyền truy cập...
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="pt-16 min-h-screen bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-2xl font-black text-slate-900 flex items-center gap-2.5">
                <div className="w-9 h-9 bg-blue-600 rounded-xl flex items-center justify-center">
                  <Shield size={18} className="text-white" />
                </div>
                Admin Dashboard
              </h1>
              <p className="text-slate-500 text-sm mt-1">
                Quản lý toàn bộ hệ thống XeViệt
              </p>
            </div>
            <Btn
              variant="ghost"
              size="sm"
              onClick={() => {
                logout();
                router.push("/");
              }}
            >
              <LogOut size={14} /> Thoát Admin
            </Btn>
          </div>

          {/* KPI cards */}
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6">
            {[
              {
                l: "Tổng tài khoản",
                v: users.length || "—",
                icon: Users,
                bg: "bg-blue-50",
                fg: "text-blue-600",
              },
              {
                l: "Tin chờ phê duyệt",
                v: pendingCars.length,
                icon: Clock,
                bg: "bg-amber-50",
                fg: "text-amber-600",
              },
              {
                l: "Danh mục",
                v: categories.length,
                icon: Tag,
                bg: "bg-violet-50",
                fg: "text-violet-600",
              },
            ].map(({ l, v, icon: Icon, bg, fg }) => (
              <div
                key={l}
                className="bg-white rounded-2xl border border-slate-100 p-5"
              >
                <div
                  className={`w-10 h-10 rounded-xl flex items-center justify-center mb-3 ${bg}`}
                >
                  <Icon size={18} className={fg} />
                </div>
                <p className="text-2xl font-black text-slate-900">{v}</p>
                <p className="text-xs text-slate-500 mt-0.5">{l}</p>
              </div>
            ))}
          </div>

          {/* Tab bar */}
          <div className="flex gap-1 bg-white rounded-2xl border border-slate-100 p-1.5 mb-5 w-fit shadow-sm">
            {tabs.map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                onClick={() => setTab(id)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold transition-all ${
                  tab === id
                    ? "bg-blue-600 text-white shadow-md"
                    : "text-slate-500 hover:text-slate-800"
                }`}
              >
                <Icon size={14} /> {label}
              </button>
            ))}
          </div>

          {/* Approvals */}
          {tab === "approvals" && (
            <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden shadow-sm">
              <div className="px-5 py-3.5 border-b border-slate-100 flex items-center justify-between">
                <h3 className="font-black text-slate-900">
                  Tin đăng chờ phê duyệt{" "}
                  <span className="text-blue-600">({pendingCars.length})</span>
                </h3>
              </div>
              {loadingCars ? (
                <Spinner />
              ) : carsError ? (
                <div className="p-5">
                  <ErrorNotice message={carsError} onRetry={loadPending} />
                </div>
              ) : pendingCars.length === 0 ? (
                <div className="p-10 text-center text-sm text-slate-500">
                  Không có tin nào đang chờ duyệt. 🎉
                </div>
              ) : (
                <div className="divide-y divide-slate-50">
                  {pendingCars.map((car) => (
                    <div
                      key={car._id}
                      className="flex items-center gap-4 px-5 py-4 hover:bg-slate-50 transition-colors"
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={
                          car.images?.[0]
                            ? toAbsoluteUrl(car.images[0])
                            : "https://images.unsplash.com/photo-1502877338535-766e1452684a?w=200&h=150&fit=crop&auto=format"
                        }
                        alt=""
                        className="w-20 h-14 object-cover rounded-xl flex-shrink-0"
                      />
                      <div className="flex-1 min-w-0">
                        <p className="font-black text-slate-900 text-sm">
                          {car.name}
                        </p>
                        <p className="text-blue-600 font-bold text-sm">
                          {formatVND(car.price)}
                        </p>
                        <p className="text-xs text-slate-400 mt-0.5">
                          {car.location} · {formatRelativeTime(car.createdAt)}
                        </p>
                      </div>
                      <Chip variant="warning">Chờ duyệt</Chip>
                      <div className="flex gap-1 flex-shrink-0">
                        <button
                          onClick={() => router.push(`/car/${car._id}`)}
                          className="p-2 rounded-xl hover:bg-blue-50 text-slate-400 hover:text-blue-600 transition-colors"
                        >
                          <Eye size={14} />
                        </button>
                        <button
                          onClick={() => handleApprove(car._id)}
                          className="p-2 rounded-xl hover:bg-emerald-50 text-slate-400 hover:text-emerald-600 transition-colors"
                        >
                          <CheckCircle size={14} />
                        </button>
                        <button
                          onClick={() => handleReject(car._id)}
                          className="p-2 rounded-xl hover:bg-red-50 text-slate-400 hover:text-red-500 transition-colors"
                        >
                          <XCircle size={14} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Users */}
          {tab === "users" && (
            <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden shadow-sm">
              <div className="px-5 py-3.5 border-b border-slate-100 flex items-center justify-between gap-3">
                <h3 className="font-black text-slate-900">
                  Tài khoản hệ thống ({users.length})
                </h3>
                <div className="relative">
                  <Search
                    size={13}
                    className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400"
                  />
                  <input
                    value={userSearch}
                    onChange={(e) => setUserSearch(e.target.value)}
                    onKeyDown={(e) =>
                      e.key === "Enter" && loadUsers(userSearch)
                    }
                    placeholder="Tìm tài khoản..."
                    className="bg-slate-50 border border-slate-200 rounded-xl py-2 pl-8 pr-3 text-xs outline-none focus:border-blue-500 w-48"
                  />
                </div>
              </div>
              {loadingUsers ? (
                <Spinner />
              ) : usersError ? (
                <div className="p-5">
                  <ErrorNotice
                    message={usersError}
                    onRetry={() => loadUsers(userSearch)}
                  />
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="bg-slate-50 border-b border-slate-100">
                      <tr>
                        {[
                          "Tên người dùng",
                          "Email",
                          "Số điện thoại",
                          "Vai trò",
                          "Trạng thái",
                          "Hành động",
                        ].map((h) => (
                          <th
                            key={h}
                            className="text-left px-5 py-3 text-xs font-black text-slate-400 uppercase tracking-wide whitespace-nowrap"
                          >
                            {h}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                      {users.map((u) => (
                        <tr
                          key={u._id}
                          className="hover:bg-slate-50/80 transition-colors"
                        >
                          <td className="px-5 py-4">
                            <div className="flex items-center gap-2.5">
                              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-400 to-blue-700 flex items-center justify-center font-black text-white text-xs shadow-sm">
                                {u.name[0]?.toUpperCase()}
                              </div>
                              <span className="font-bold text-slate-900 whitespace-nowrap">
                                {u.name}
                              </span>
                            </div>
                          </td>
                          <td className="px-5 py-4 text-slate-600 text-xs">
                            {u.email}
                          </td>
                          <td className="px-5 py-4 text-slate-600 text-xs whitespace-nowrap">
                            {u.phone}
                          </td>
                          <td className="px-5 py-4">
                            <Chip
                              variant={u.role === "admin" ? "info" : "default"}
                            >
                              {u.role === "admin" ? "Admin" : "Người dùng"}
                            </Chip>
                          </td>
                          <td className="px-5 py-4">
                            <Chip
                              variant={
                                u.status === "active" ? "success" : "danger"
                              }
                            >
                              {u.status === "active" ? "Hoạt động" : "Bị khóa"}
                            </Chip>
                          </td>
                          <td className="px-5 py-4">
                            <div className="flex gap-1">
                              <button
                                onClick={() => handleToggleLock(u)}
                                title={
                                  u.status === "active"
                                    ? "Khóa tài khoản"
                                    : "Mở khóa"
                                }
                                className="p-1.5 rounded-lg hover:bg-amber-50 text-slate-400 hover:text-amber-500 transition-colors"
                              >
                                {u.status === "active" ? (
                                  <Lock size={13} />
                                ) : (
                                  <Unlock size={13} />
                                )}
                              </button>
                              <button
                                onClick={() => handleDeleteUser(u._id)}
                                title="Xóa tài khoản"
                                className="p-1.5 rounded-lg hover:bg-red-50 text-slate-400 hover:text-red-500 transition-colors"
                              >
                                <Trash2 size={13} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* Categories */}
          {tab === "categories" && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {loadingCategories ? (
                <Spinner />
              ) : (
                CATEGORY_GROUPS.map(({ group, title }) => {
                  const items = categories.filter((c) => c.group === group);
                  return (
                    <div
                      key={group}
                      className="bg-white rounded-2xl border border-slate-100 overflow-hidden shadow-sm"
                    >
                      <div className="px-5 py-3.5 border-b border-slate-100">
                        <h3 className="font-black text-slate-900 text-sm">
                          {title}
                        </h3>
                      </div>
                      <div className="p-3 space-y-1">
                        {items.length === 0 && (
                          <p className="text-xs text-slate-400 px-3 py-2">
                            Chưa có mục nào.
                          </p>
                        )}
                        {items.map((item) => (
                          <div
                            key={item._id}
                            className="flex items-center justify-between px-3 py-2.5 rounded-xl hover:bg-slate-50 transition-colors group"
                          >
                            <div className="flex items-center gap-2.5 min-w-0">
                              {group === "brand" && (
                                <label
                                  className="relative w-9 h-9 rounded-full overflow-hidden bg-slate-100 border border-slate-200 flex-shrink-0 cursor-pointer flex items-center justify-center group/avatar"
                                  title="Bấm để tải ảnh logo hãng"
                                >
                                  <input
                                    type="file"
                                    accept="image/*"
                                    className="hidden"
                                    onChange={(e) => {
                                      const file = e.target.files?.[0];
                                      if (file)
                                        handleUploadBrandImage(item._id, file);
                                      e.target.value = "";
                                    }}
                                  />
                                  {item.imageUrl ? (
                                    // eslint-disable-next-line @next/next/no-img-element
                                    <img
                                      src={toAbsoluteUrl(item.imageUrl)}
                                      alt={item.name}
                                      className="w-full h-full object-contain p-1"
                                    />
                                  ) : (
                                    <span className="text-xs font-black text-slate-400">
                                      {item.name[0]}
                                    </span>
                                  )}
                                  <span className="absolute inset-0 bg-black/40 opacity-0 group-hover/avatar:opacity-100 flex items-center justify-center text-white text-[9px] font-bold transition-opacity">
                                    {uploadingImageId === item._id
                                      ? "..."
                                      : "Đổi ảnh"}
                                  </span>
                                </label>
                              )}
                              <span className="text-sm font-semibold text-slate-700 truncate">
                                {item.name}
                              </span>
                            </div>
                            <button
                              onClick={() => handleDeleteCategory(item._id)}
                              className="opacity-0 group-hover:opacity-100 p-1.5 rounded-lg hover:bg-red-50 text-slate-400 hover:text-red-500 transition-all flex-shrink-0"
                            >
                              <Trash2 size={12} />
                            </button>
                          </div>
                        ))}
                        <div className="flex gap-2 pt-2 px-1">
                          <Field
                            placeholder={`Thêm ${title.toLowerCase()}...`}
                            value={newCategoryName[group]}
                            onChange={(e) =>
                              setNewCategoryName((prev) => ({
                                ...prev,
                                [group]: e.target.value,
                              }))
                            }
                          />
                          <Btn
                            size="sm"
                            variant="secondary"
                            onClick={() => handleAddCategory(group)}
                          >
                            <Plus size={12} /> Thêm
                          </Btn>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          )}
          {tab === "manageCars" && <AdminCarsManagement />}
        </div>
      </div>
    </div>
  );
}
