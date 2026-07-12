# XeViệt – Next.js Frontend (đã nối Backend thật)

Frontend cho sàn giao dịch xe cũ "XeViệt" — **Next.js 14 (App Router) + TypeScript + Tailwind CSS**, gọi API thật từ backend NestJS (không còn dùng mock data/localStorage giả).

## Chạy thử

Cần chạy **backend trước** (xem project `xeviet-backend`, mặc định cổng 8081, đã `npm run seed`).

```bash
npm install
# .env.local đã có sẵn, kiểm tra lại NEXT_PUBLIC_API_URL cho đúng cổng backend
npm run dev
```

Mở `http://localhost:3000`.

Tài khoản mẫu (sau khi backend đã `npm run seed`):
- Admin: `admin@xeviet.vn` / `Admin@123`
- User: `user@example.com` / `User@12345`

## Cấu trúc thư mục

```
app/
  page.tsx                 → Trang chủ (/)
  login/, register/, verify/ → Đăng nhập / Đăng ký / Xác thực OTP
  search/page.tsx           → Tìm kiếm xe (lọc/sắp xếp/phân trang thật)
  car/[id]/page.tsx         → Chi tiết xe (fetch theo _id MongoDB thật)
  post-car/page.tsx         → Đăng tin bán xe (upload ảnh + gọi API tạo tin)
  seller/page.tsx           → Dashboard người bán (tin đăng thật, xóa tin)
  admin/page.tsx            → Dashboard quản trị (duyệt tin, quản lý user, danh mục — API thật)
  profile/page.tsx          → Hồ sơ cá nhân (đổi thông tin/mật khẩu thật)
components/
  Header, Footer, CarCard, AuthLayout, ui.tsx (Btn, Field, Dropdown, Chip, Spinner, ErrorNotice)
lib/
  api.ts             → API client dùng chung (gắn JWT, dựng URL ảnh, xử lý lỗi)
  api-cars.ts        → Gọi /cars/...
  api-categories.ts  → Gọi /categories/...
  api-users.ts       → Gọi /users/... (hồ sơ, yêu thích, quản lý admin)
  api-uploads.ts     → Gọi /uploads/... (upload ảnh)
  auth.tsx           → AuthProvider/useAuth — gọi /auth/... thật, lưu JWT
  format.ts          → Định dạng tiền tệ (₫) và thời gian tương đối
```

## Điểm khác so với bản mock trước đây

- **Không còn mock data** (`lib/data.ts` đã xóa) — mọi dữ liệu (xe, danh mục, người dùng) đều fetch từ backend NestJS.
- **`lib/auth.tsx` gọi API thật**: `/auth/register`, `/auth/verify-otp`, `/auth/resend-otp`, `/auth/login`, `/auth/me`. Role (`user`/`admin`) lấy từ JWT do server cấp — không còn suy đoán qua email.
- **JWT lưu trong `localStorage`** (key `xeviet_token`). Khi tải lại trang, `AuthProvider` tự gọi `/auth/me` để khôi phục phiên đăng nhập.
- **Ảnh upload thật**: trang Đăng tin upload file lên `/uploads/image(s)` của backend, nhận về đường dẫn tương đối rồi lưu vào tin đăng. Hàm `toAbsoluteUrl()` trong `lib/api.ts` tự ghép domain backend để hiển thị ảnh.
- **Phân quyền Admin**: giữ nguyên cơ chế đã làm trước đó (Header chỉ hiện link Admin khi đã đăng nhập đúng role, `/admin` tự kiểm tra và đá về `/login` nếu không đủ quyền) — giờ dựa trên role thật từ backend thay vì đoán qua email.

## Những phần được đơn giản hóa (có thể mở rộng sau)

- **Sửa tin đăng**: nút "sửa" trên Dashboard người bán hiện đang dẫn tới trang xem chi tiết; form điền sẵn dữ liệu cũ để sửa (edit mode) chưa được làm — có thể bổ sung bằng cách tái sử dụng `app/post-car/page.tsx` với query `?edit=<id>` và gọi `updateCar()` trong `lib/api-cars.ts` (hàm PATCH đã có sẵn ở backend).
- **Chat với người bán / Gửi yêu cầu xem xe**: nút hiện chỉ yêu cầu đăng nhập, chưa có backend chat/lead thật — cần thêm module riêng nếu muốn triển khai.
- **Biểu đồ thống kê theo tháng**: đã bỏ khỏi Dashboard người bán vì backend chưa có API thống kê theo thời gian (tránh hiển thị số liệu giả). Thay vào đó hiển thị tổng số liệu thật (tổng tin, tổng lượt xem...). Có thể bổ sung endpoint `/cars/mine/stats` ở BE nếu cần biểu đồ.

## Công nghệ sử dụng

- Next.js 14 (App Router) · TypeScript · Tailwind CSS
- Framer Motion · Lucide React · Recharts (còn dùng nếu bổ sung biểu đồ sau này)
