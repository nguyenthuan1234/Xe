"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Search,
  Eye,
  CheckCircle,
  XCircle,
  Trash2,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { Chip, Btn, Field, Spinner, ErrorNotice } from "@/components/ui";
import {
  fetchAllCarsAdmin,
  approveCar,
  rejectCar,
  deleteCar,
  sellerName,
  type ApiCar,
  type CarQueryParams,
} from "@/lib/api-cars";
import { toAbsoluteUrl, ApiError } from "@/lib/api";
import { formatVND, formatRelativeTime } from "@/lib/format";

type StatusFilter = "all" | "pending" | "active" | "rejected";

const STATUS_TABS: { id: StatusFilter; label: string }[] = [
  { id: "all", label: "Tất cả" },
  { id: "pending", label: "Chờ duyệt" },
  { id: "active", label: "Đã duyệt" },
  { id: "rejected", label: "Từ chối" },
];

function statusChipVariant(status: ApiCar["status"]) {
  if (status === "active") return "success";
  if (status === "rejected") return "danger";
  return "warning";
}

function statusLabel(status: ApiCar["status"]) {
  if (status === "active") return "Đã duyệt";
  if (status === "rejected") return "Từ chối";
  return "Chờ duyệt";
}

export default function AdminCarsManagement() {
  const router = useRouter();

  const [cars, setCars] = useState<ApiCar[]>([]);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [page, setPage] = useState(1);
  const [limit] = useState(10);

  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [search, setSearch] = useState("");
  const [searchInput, setSearchInput] = useState("");

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [actingId, setActingId] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const params: CarQueryParams & { status?: string } = {
        page,
        limit,
        search: search || undefined,
      };
      if (statusFilter !== "all") params.status = statusFilter;

      const res = await fetchAllCarsAdmin(params as CarQueryParams);
      setCars(res.items);
      setTotal(res.total);
      setTotalPages(res.totalPages || 1);
    } catch (err) {
      setError(
        err instanceof ApiError
          ? err.message
          : "Không tải được danh sách bài đăng.",
      );
    } finally {
      setLoading(false);
    }
  }, [page, limit, search, statusFilter]);

  useEffect(() => {
    load();
  }, [load]);

  useEffect(() => {
    setPage(1);
  }, [statusFilter, search]);

  const handleApprove = async (id: string) => {
    setActingId(id);
    try {
      const updated = await approveCar(id);
      setCars((prev) => prev.map((c) => (c._id === id ? updated : c)));
    } catch (err) {
      alert(err instanceof ApiError ? err.message : "Duyệt tin thất bại.");
    } finally {
      setActingId(null);
    }
  };

  const handleReject = async (id: string) => {
    if (!confirm("Từ chối tin đăng này?")) return;
    setActingId(id);
    try {
      const updated = await rejectCar(id);
      setCars((prev) => prev.map((c) => (c._id === id ? updated : c)));
    } catch (err) {
      alert(err instanceof ApiError ? err.message : "Từ chối tin thất bại.");
    } finally {
      setActingId(null);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Xóa vĩnh viễn tin đăng này? Hành động không thể hoàn tác."))
      return;
    setActingId(id);
    try {
      await deleteCar(id);
      setCars((prev) => prev.filter((c) => c._id !== id));
      setTotal((t) => Math.max(0, t - 1));
    } catch (err) {
      alert(err instanceof ApiError ? err.message : "Xóa tin thất bại.");
    } finally {
      setActingId(null);
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden shadow-sm">
      {/* Header: title + search */}
      <div className="px-5 py-3.5 border-b border-slate-100 flex flex-wrap items-center justify-between gap-3">
        <h3 className="font-black text-slate-900">
          Quản lý bài đăng <span className="text-blue-600">({total})</span>
        </h3>
        <div className="relative">
          <Search
            size={13}
            className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400"
          />
          <input
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && setSearch(searchInput)}
            placeholder="Tìm theo tên xe..."
            className="bg-slate-50 border border-slate-200 rounded-xl py-2 pl-8 pr-3 text-xs outline-none focus:border-blue-500 w-56"
          />
        </div>
      </div>

      {/* Status filter tabs */}
      <div className="px-5 py-3 border-b border-slate-100 flex gap-1.5 flex-wrap">
        {STATUS_TABS.map(({ id, label }) => (
          <button
            key={id}
            onClick={() => setStatusFilter(id)}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${
              statusFilter === id
                ? "bg-blue-600 text-white"
                : "bg-slate-50 text-slate-500 hover:bg-slate-100"
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {loading ? (
        <Spinner />
      ) : error ? (
        <div className="p-5">
          <ErrorNotice message={error} onRetry={load} />
        </div>
      ) : cars.length === 0 ? (
        <div className="p-10 text-center text-sm text-slate-500">
          Không có bài đăng nào phù hợp.
        </div>
      ) : (
        <>
          <div className="divide-y divide-slate-50">
            {cars.map((car) => (
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
                  <p className="font-black text-slate-900 text-sm truncate">
                    {car.name}
                  </p>
                  <p className="text-blue-600 font-bold text-sm">
                    {formatVND(car.price)}
                  </p>
                  <p className="text-xs text-slate-400 mt-0.5">
                    {sellerName(car)} · {car.location} ·{" "}
                    {formatRelativeTime(car.createdAt)}
                  </p>
                </div>
                <Chip variant={statusChipVariant(car.status)}>
                  {statusLabel(car.status)}
                </Chip>
                <div className="flex gap-1 flex-shrink-0">
                  <button
                    onClick={() => router.push(`/car/${car._id}`)}
                    title="Xem chi tiết"
                    className="p-2 rounded-xl hover:bg-blue-50 text-slate-400 hover:text-blue-600 transition-colors"
                  >
                    <Eye size={14} />
                  </button>
                  {car.status !== "active" && (
                    <button
                      onClick={() => handleApprove(car._id)}
                      disabled={actingId === car._id}
                      title="Duyệt tin"
                      className="p-2 rounded-xl hover:bg-emerald-50 text-slate-400 hover:text-emerald-600 transition-colors disabled:opacity-40"
                    >
                      <CheckCircle size={14} />
                    </button>
                  )}
                  {car.status !== "rejected" && (
                    <button
                      onClick={() => handleReject(car._id)}
                      disabled={actingId === car._id}
                      title="Từ chối tin"
                      className="p-2 rounded-xl hover:bg-amber-50 text-slate-400 hover:text-amber-600 transition-colors disabled:opacity-40"
                    >
                      <XCircle size={14} />
                    </button>
                  )}
                  <button
                    onClick={() => handleDelete(car._id)}
                    disabled={actingId === car._id}
                    title="Xóa tin"
                    className="p-2 rounded-xl hover:bg-red-50 text-slate-400 hover:text-red-500 transition-colors disabled:opacity-40"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="px-5 py-3.5 border-t border-slate-100 flex items-center justify-between">
              <p className="text-xs text-slate-400">
                Trang {page} / {totalPages}
              </p>
              <div className="flex gap-2">
                <Btn
                  size="sm"
                  variant="ghost"
                  disabled={page <= 1}
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                >
                  <ChevronLeft size={14} /> Trước
                </Btn>
                <Btn
                  size="sm"
                  variant="ghost"
                  disabled={page >= totalPages}
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                >
                  Sau <ChevronRight size={14} />
                </Btn>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
