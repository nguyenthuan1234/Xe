import { apiFetch } from "./api";

export async function uploadImage(file: File): Promise<string> {
  const form = new FormData();
  form.append("file", file);
  const res = await apiFetch<{ url: string }>("/uploads/image", { method: "POST", body: form });
  return res.url;
}

export async function uploadImages(files: File[]): Promise<string[]> {
  const form = new FormData();
  files.forEach((f) => form.append("files", f));
  const res = await apiFetch<{ urls: string[] }>("/uploads/images", { method: "POST", body: form });
  return res.urls;
}
