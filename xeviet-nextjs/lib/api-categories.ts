import { apiFetch, buildQuery } from "./api";

export type CategoryGroup = "brand" | "carType" | "model" | "location";

export interface ApiCategory {
  _id: string;
  name: string;
  group: CategoryGroup;
  colorHex?: string;
  imageUrl?: string;
}

export function fetchCategories(group?: CategoryGroup) {
  return apiFetch<ApiCategory[]>(`/categories${buildQuery({ group })}`);
}

export function createCategory(data: { name: string; group: CategoryGroup; colorHex?: string; imageUrl?: string }) {
  return apiFetch<ApiCategory>("/categories", { method: "POST", body: JSON.stringify(data) });
}

export function updateCategory(id: string, data: Partial<{ name: string; group: CategoryGroup; colorHex?: string; imageUrl?: string }>) {
  return apiFetch<ApiCategory>(`/categories/${id}`, { method: "PATCH", body: JSON.stringify(data) });
}

export function deleteCategory(id: string) {
  return apiFetch<{ message: string }>(`/categories/${id}`, { method: "DELETE" });
}
