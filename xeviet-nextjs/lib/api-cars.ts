import { apiFetch, buildQuery } from "./api";

export interface ApiSeller {
  _id: string;
  name: string;
  avatar?: string;
  verifiedSeller?: boolean;
  createdAt?: string;
}

export interface ApiCar {
  _id: string;
  name: string;
  price: number;
  year: number;
  km: number;
  fuel: string;
  transmission: string;
  location: string;
  brand: string;
  type: string;
  images: string[];
  videoUrl?: string;
  description: string;
  seller: ApiSeller | string;
  sellerPhone: string;
  verified: boolean;
  views: number;
  status: "pending" | "active" | "rejected";
  badge?: string;
  condition?: Record<string, string>;
  legalInfo?: Record<string, string>;
  createdAt: string;
  updatedAt: string;
}

export interface Paginated<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface CarQueryParams {
  search?: string;
  brand?: string;
  type?: string;
  location?: string;
  fuel?: string;
  transmission?: string;
  priceMin?: number;
  priceMax?: number;
  yearMin?: number;
  yearMax?: number;
  sort?: "newest" | "price_asc" | "price_desc" | "most_viewed";
  page?: number;
  limit?: number;
}

export interface CreateCarInput {
  name: string;
  price: number;
  year: number;
  km: number;
  fuel: string;
  transmission: string;
  location: string;
  brand: string;
  type: string;
  images?: string[];
  videoUrl?: string;
  description?: string;
  sellerPhone: string;
  badge?: string;
  condition?: Record<string, string>;
  legalInfo?: Record<string, string>;
}

export function fetchCars(params: CarQueryParams = {}) {
  return apiFetch<Paginated<ApiCar>>(`/cars${buildQuery(params as Record<string, string | number | undefined>)}`);
}

export function fetchCarById(id: string) {
  return apiFetch<ApiCar>(`/cars/${id}`);
}

export function fetchMyCars(params: CarQueryParams = {}) {
  return apiFetch<Paginated<ApiCar>>(`/cars/mine${buildQuery(params as Record<string, string | number | undefined>)}`);
}

export function createCar(data: CreateCarInput) {
  return apiFetch<ApiCar>("/cars", { method: "POST", body: JSON.stringify(data) });
}

export function updateCar(id: string, data: Partial<CreateCarInput>) {
  return apiFetch<ApiCar>(`/cars/${id}`, { method: "PATCH", body: JSON.stringify(data) });
}

export function deleteCar(id: string) {
  return apiFetch<{ message: string }>(`/cars/${id}`, { method: "DELETE" });
}

export function fetchPendingCars(params: CarQueryParams = {}) {
  return apiFetch<Paginated<ApiCar>>(`/cars/admin/pending${buildQuery(params as Record<string, string | number | undefined>)}`);
}

export function fetchAllCarsAdmin(params: CarQueryParams = {}) {
  return apiFetch<Paginated<ApiCar>>(`/cars/admin/all${buildQuery(params as Record<string, string | number | undefined>)}`);
}

export function approveCar(id: string) {
  return apiFetch<ApiCar>(`/cars/${id}/approve`, { method: "PATCH" });
}

export function rejectCar(id: string) {
  return apiFetch<ApiCar>(`/cars/${id}/reject`, { method: "PATCH" });
}

export function sellerName(car: ApiCar): string {
  return typeof car.seller === "string" ? "Người bán" : car.seller?.name || "Người bán";
}
