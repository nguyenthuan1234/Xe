export function formatVND(amount: number): string {
  return `${amount.toLocaleString("vi-VN")} ₫`;
}

export function formatRelativeTime(dateInput: string | Date): string {
  const date = typeof dateInput === "string" ? new Date(dateInput) : dateInput;
  const diffMs = Date.now() - date.getTime();
  const minute = 60 * 1000;
  const hour = 60 * minute;
  const day = 24 * hour;

  if (diffMs < hour) {
    const m = Math.max(1, Math.floor(diffMs / minute));
    return `${m} phút trước`;
  }
  if (diffMs < day) {
    return `${Math.floor(diffMs / hour)} giờ trước`;
  }
  if (diffMs < 7 * day) {
    return `${Math.floor(diffMs / day)} ngày trước`;
  }
  if (diffMs < 30 * day) {
    return `${Math.floor(diffMs / (7 * day))} tuần trước`;
  }
  return date.toLocaleDateString("vi-VN");
}
