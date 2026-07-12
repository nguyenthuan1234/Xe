# XeViệt – Backend (NestJS + MongoDB)

Backend cho sàn giao dịch xe cũ "XeViệt". Xây bằng **NestJS 10 + Mongoose (MongoDB) + JWT + class-validator**.

## Cài đặt & chạy

Yêu cầu: Node.js ≥ 18, MongoDB đang chạy (local hoặc Atlas).

```bash
npm install
cp .env.example .env     # rồi sửa MONGODB_URI / JWT_SECRET nếu cần
npm run seed              # tạo dữ liệu mẫu: tài khoản admin/user + xe mẫu + danh mục
npm run start:dev         # chạy ở chế độ dev (hot reload), mặc định cổng 3001
```

API gốc: `http://localhost:3001/api`
File ảnh upload: `http://localhost:3001/uploads/<filename>`

### Tài khoản mẫu sau khi `npm run seed`

| Vai trò | Email | Mật khẩu |
|---|---|---|
| Admin | `admin@xeviet.vn` | `Admin@123` |
| User (người bán) | `user@example.com` | `User@12345` |

## Cấu trúc thư mục

```
src/
  auth/          → Đăng ký, xác thực OTP, đăng nhập (JWT)
  users/         → Hồ sơ cá nhân, đổi mật khẩu, yêu thích, quản lý tài khoản (admin)
  cars/          → CRUD tin đăng, tìm kiếm/lọc, duyệt tin (admin)
  categories/    → Hãng xe / Loại xe / Khu vực / Dòng xe (dùng đổ Dropdown ở FE)
  uploads/       → Upload ảnh (multer, lưu ở thư mục /uploads)
  common/        → Guard (JwtAuthGuard, RolesGuard), decorator (@Roles, @CurrentUser)
  seed.ts        → Script tạo dữ liệu mẫu
```

## Luồng xác thực & phân quyền

- Đăng ký → nhận mã OTP (6 số) → xác thực OTP → tài khoản `isVerified = true` → **tự động đăng nhập, trả JWT**.
- Đăng nhập → server trả `role` thật từ CSDL (`user` hoặc `admin`) trong JWT payload — **không còn đoán role qua email như bản mock ở FE trước đó**.
- Route yêu cầu đăng nhập: gắn `@UseGuards(JwtAuthGuard)`, header `Authorization: Bearer <token>`.
- Route chỉ dành cho admin: gắn thêm `@UseGuards(JwtAuthGuard, RolesGuard)` + `@Roles("admin")`.
- Vì chưa tích hợp dịch vụ gửi email/SMS thật, OTP hiện được **trả kèm trong response** (field `devOtp`) khi `NODE_ENV !== production`, để bạn test được ngay. Khi lên production, hãy:
  1. Tích hợp Nodemailer/SES/Twilio... trong `auth.service.ts` (chỗ có `// TODO`)
  2. Bỏ field `devOtp` khỏi response

## API Reference

### Auth (`/api/auth`)
| Method | Endpoint | Mô tả | Quyền |
|---|---|---|---|
| POST | `/auth/register` | Đăng ký tài khoản mới | Công khai |
| POST | `/auth/verify-otp` | Xác thực OTP, trả về JWT | Công khai |
| POST | `/auth/resend-otp` | Gửi lại mã OTP | Công khai |
| POST | `/auth/login` | Đăng nhập, trả về JWT + user | Công khai |
| GET | `/auth/me` | Lấy thông tin user hiện tại | Đăng nhập |

### Users (`/api/users`)
| Method | Endpoint | Mô tả | Quyền |
|---|---|---|---|
| GET | `/users/me` | Hồ sơ của tôi | Đăng nhập |
| PATCH | `/users/me` | Cập nhật hồ sơ | Đăng nhập |
| PATCH | `/users/me/password` | Đổi mật khẩu | Đăng nhập |
| POST | `/users/me/favorites/:carId` | Bật/tắt yêu thích 1 xe | Đăng nhập |
| GET | `/users/me/favorites` | Danh sách xe đã yêu thích | Đăng nhập |
| GET | `/users?search=&role=&status=&page=&limit=` | Danh sách tài khoản | Admin |
| GET | `/users/:id` | Chi tiết 1 tài khoản | Admin |
| PATCH | `/users/:id` | Sửa role / khóa-mở khóa | Admin |
| DELETE | `/users/:id` | Xóa tài khoản | Admin |

### Cars (`/api/cars`)
| Method | Endpoint | Mô tả | Quyền |
|---|---|---|---|
| GET | `/cars?search=&brand=&type=&location=&priceMin=&priceMax=&sort=&page=&limit=` | Danh sách xe (chỉ tin đã duyệt) | Công khai |
| GET | `/cars/:id` | Chi tiết xe (tự tăng view) | Công khai |
| GET | `/cars/mine` | Tin đăng của tôi (mọi trạng thái) | Đăng nhập |
| POST | `/cars` | Đăng tin mới (trạng thái mặc định `pending`) | Đăng nhập |
| PATCH | `/cars/:id` | Sửa tin (chủ tin hoặc admin) | Đăng nhập |
| DELETE | `/cars/:id` | Xóa tin (chủ tin hoặc admin) | Đăng nhập |
| GET | `/cars/admin/pending` | Tin chờ duyệt | Admin |
| GET | `/cars/admin/all` | Tất cả tin (mọi trạng thái) | Admin |
| PATCH | `/cars/:id/approve` | Duyệt tin | Admin |
| PATCH | `/cars/:id/reject` | Từ chối tin | Admin |

### Categories (`/api/categories`)
| Method | Endpoint | Mô tả | Quyền |
|---|---|---|---|
| GET | `/categories?group=brand\|carType\|model\|location` | Danh sách danh mục | Công khai |
| POST | `/categories` | Thêm danh mục | Admin |
| PATCH | `/categories/:id` | Sửa danh mục | Admin |
| DELETE | `/categories/:id` | Xóa danh mục | Admin |

### Uploads (`/api/uploads`)
| Method | Endpoint | Mô tả | Quyền |
|---|---|---|---|
| POST | `/uploads/image` (form-data, field `file`) | Upload 1 ảnh | Đăng nhập |
| POST | `/uploads/images` (form-data, field `files`, nhiều file) | Upload nhiều ảnh | Đăng nhập |

## Nối với Frontend (Next.js)

1. Ở project FE, tạo `.env.local`:
   ```
   NEXT_PUBLIC_API_URL=http://localhost:3001/api
   ```
2. Trong `lib/auth.tsx` (FE), thay nội dung mock của `login()` / `registerAndLogin()` bằng `fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/login`, ...)`, lấy `role` thật từ response thay vì đoán qua email.
3. Trong `lib/data.ts` (FE), thay mảng `CARS`/`BRANDS` tĩnh bằng `fetch` tới `/api/cars` và `/api/categories`.
4. CORS đã được bật sẵn cho origin khai báo ở `CORS_ORIGIN` trong `.env` (mặc định `http://localhost:3000`).

## Ghi chú triển khai thực tế (trước khi lên production)

- Đổi `JWT_SECRET` sang chuỗi ngẫu nhiên đủ mạnh, không commit `.env`.
- Tích hợp gửi OTP qua email/SMS thật, bỏ field `devOtp`.
- Cân nhắc dùng Cloudinary/S3 thay vì lưu ảnh local (`/uploads`) để dễ scale.
- Thêm rate-limiting cho `/auth/login`, `/auth/register` (vd: `@nestjs/throttler`) để chống brute-force.
- Thêm index MongoDB phù hợp khi dữ liệu lớn (đã có sẵn text-index cho tìm kiếm xe, index email cho user).
