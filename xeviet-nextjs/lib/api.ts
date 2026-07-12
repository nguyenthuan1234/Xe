const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8081/api";
// Gốc server (không có /api) — dùng để ghép với đường dẫn ảnh trả về từ /uploads
const SERVER_ORIGIN = API_URL.replace(/\/api\/?$/, "");

const TOKEN_KEY = "xeviet_token";

export function getToken(): string | null {
  if (typeof window === "undefined") return null;
  try {
    return localStorage.getItem(TOKEN_KEY);
  } catch {
    return null;
  }
}

export function setToken(token: string | null) {
  if (typeof window === "undefined") return;
  try {
    if (token) localStorage.setItem(TOKEN_KEY, token);
    else localStorage.removeItem(TOKEN_KEY);
  } catch {
    // localStorage không khả dụng — bỏ qua
  }
}

export class ApiError extends Error {
  status: number;
  constructor(message: string, status: number) {
    super(message);
    this.status = status;
  }
}

/**
 * Gọi API backend. Tự gắn Bearer token nếu có, tự set Content-Type JSON
 * (trừ khi body là FormData — để trình duyệt tự set boundary).
 */
export async function apiFetch<T>(path: string, options: RequestInit = {}): Promise<T> {
  const token = getToken();
  const isFormData = typeof FormData !== "undefined" && options.body instanceof FormData;

  const headers: Record<string, string> = {
    ...(isFormData ? {} : { "Content-Type": "application/json" }),
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...((options.headers as Record<string, string>) || {}),
  };

  let res: Response;
  try {
    res = await fetch(`${API_URL}${path}`, { ...options, headers });
  } catch {
    throw new ApiError("Không thể kết nối đến máy chủ. Vui lòng kiểm tra backend đã chạy chưa.", 0);
  }

  const isJson = res.headers.get("content-type")?.includes("application/json");
  const data = isJson ? await res.json().catch(() => null) : null;

  if (!res.ok) {
    const rawMessage = data?.message ?? `Lỗi ${res.status}`;
    const message = Array.isArray(rawMessage) ? rawMessage.join(", ") : rawMessage;
    throw new ApiError(message, res.status);
  }

  return data as T;
}

/** Ghép đường dẫn ảnh tương đối (vd "/uploads/xxx.jpg") thành URL đầy đủ */
export function toAbsoluteUrl(path?: string | null): string {
  if (!path) return "";
  if (/^https?:\/\//i.test(path)) return path;
  return `${SERVER_ORIGIN}${path.startsWith("/") ? "" : "/"}${path}`;
}

export function buildQuery(params: Record<string, string | number | undefined | null>): string {
  const query = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== "") query.set(key, String(value));
  });
  const qs = query.toString();
  return qs ? `?${qs}` : "";
}

export { API_URL };
