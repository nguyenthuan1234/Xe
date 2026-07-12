import { apiFetch, buildQuery } from "./api";
import type { ApiCar, Paginated } from "./api-cars";

export interface ApiUser {
  _id: string;
  name: string;
  email: string;
  phone: string;
  role: "user" | "admin";
  status: "active" | "locked";
  isVerified: boolean;
  verifiedSeller: boolean;
  avatar?: string;
  dateOfBirth?: string;
  province?: string;
  favoriteCarIds: string[];
  createdAt: string;
}

export interface UpdateProfileInput {
  name?: string;
  phone?: string;
  dateOfBirth?: string;
  province?: string;
  avatar?: string;
}

export function updateMyProfile(data: UpdateProfileInput) {
  return apiFetch<ApiUser>("/users/me", { method: "PATCH", body: JSON.stringify(data) });
}

export function changeMyPassword(data: { currentPassword: string; newPassword: string }) {
  return apiFetch<{ message: string }>("/users/me/password", { method: "PATCH", body: JSON.stringify(data) });
}

export function toggleFavorite(carId: string) {
  return apiFetch<{ favorited: boolean; favoriteCarIds: string[] }>(`/users/me/favorites/${carId}`, { method: "POST" });
}

export function fetchMyFavorites() {
  return apiFetch<ApiCar[]>("/users/me/favorites");
}

export interface QueryUsersParams {
  search?: string;
  role?: "user" | "admin";
  status?: "active" | "locked";
  page?: number;
  limit?: number;
}

export function fetchUsersAdmin(params: QueryUsersParams = {}) {
  return apiFetch<Paginated<ApiUser>>(`/users${buildQuery(params as Record<string, string | number | undefined>)}`);
}

export function updateUserAdmin(id: string, data: Partial<{ name: string; role: "user" | "admin"; status: "active" | "locked" }>) {
  return apiFetch<ApiUser>(`/users/${id}`, { method: "PATCH", body: JSON.stringify(data) });
}

export function deleteUserAdmin(id: string) {
  return apiFetch<{ message: string }>(`/users/${id}`, { method: "DELETE" });
}
