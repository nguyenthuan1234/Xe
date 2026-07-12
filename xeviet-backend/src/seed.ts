/* eslint-disable no-console */
import "dotenv/config";
import mongoose from "mongoose";
import * as bcrypt from "bcrypt";
import { UserSchema } from "./users/schemas/user.schema";
import { CarSchema } from "./cars/schemas/car.schema";
import { CategorySchema } from "./categories/schemas/category.schema";

const MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost:27017/xeviet";

const BRANDS = [
  { name: "Toyota", colorHex: "#EB0A1E" },
  { name: "Honda", colorHex: "#CC0000" },
  { name: "Mazda", colorHex: "#1a1a2e" },
  { name: "Ford", colorHex: "#003499" },
  { name: "Hyundai", colorHex: "#002C5F" },
  { name: "Kia", colorHex: "#05141F" },
  { name: "Mercedes", colorHex: "#1a1a1a" },
  { name: "BMW", colorHex: "#0066B2" },
  { name: "Mitsubishi", colorHex: "#CC0000" },
  { name: "Suzuki", colorHex: "#004B97" },
];

const CAR_TYPES = ["Sedan", "SUV", "Hatchback", "Pickup", "MPV", "Minivan", "Bán tải"];
const LOCATIONS = ["Hà Nội", "TP.HCM", "Đà Nẵng", "Hải Phòng", "Cần Thơ", "Bình Dương"];
const MODELS = ["Camry", "CR-V", "CX-5", "Ranger", "Tucson", "Seltos", "Corolla", "Vios", "Fortuner"];

async function seed() {
  await mongoose.connect(MONGODB_URI);
  console.log("✅ Đã kết nối MongoDB:", MONGODB_URI);

  const UserModel = mongoose.model("User", UserSchema);
  const CarModel = mongoose.model("Car", CarSchema);
  const CategoryModel = mongoose.model("Category", CategorySchema);

  // ── Xóa dữ liệu cũ (chỉ dùng cho môi trường dev/demo) ──────────────────
  await Promise.all([UserModel.deleteMany({}), CarModel.deleteMany({}), CategoryModel.deleteMany({})]);
  console.log("🗑️  Đã xóa dữ liệu cũ.");

  // ── Tài khoản mẫu ────────────────────────────────────────────────────
  const adminPasswordHash = await bcrypt.hash("Admin@123", 10);
  const userPasswordHash = await bcrypt.hash("User@12345", 10);

  const admin = await UserModel.create({
    name: "Quản trị viên",
    email: "admin@xeviet.vn",
    phone: "0900000000",
    passwordHash: adminPasswordHash,
    role: "admin",
    status: "active",
    isVerified: true,
  });

  const seller = await UserModel.create({
    name: "Nguyễn Văn An",
    email: "user@example.com",
    phone: "0912345678",
    passwordHash: userPasswordHash,
    role: "user",
    status: "active",
    isVerified: true,
    verifiedSeller: true,
  });

  console.log("👤 Tài khoản Admin: admin@xeviet.vn / Admin@123");
  console.log("👤 Tài khoản User:  user@example.com / User@12345");

  // ── Danh mục ─────────────────────────────────────────────────────────
  await CategoryModel.insertMany(BRANDS.map((b) => ({ name: b.name, group: "brand", colorHex: b.colorHex })));
  await CategoryModel.insertMany(CAR_TYPES.map((name) => ({ name, group: "carType" })));
  await CategoryModel.insertMany(LOCATIONS.map((name) => ({ name, group: "location" })));
  await CategoryModel.insertMany(MODELS.map((name) => ({ name, group: "model" })));
  console.log("🏷️  Đã tạo danh mục: hãng xe, loại xe, khu vực, dòng xe.");

  // ── Xe mẫu (khớp mock data ở FE) ────────────────────────────────────
  const cars = [
    {
      name: "Toyota Camry 2.5Q 2022",
      price: 1185000000,
      year: 2022,
      km: 28500,
      fuel: "Xăng",
      transmission: "Tự động",
      location: "Hà Nội",
      brand: "Toyota",
      type: "Sedan",
      images: ["https://images.unsplash.com/photo-1621007947382-bb3c3994e3fb?w=600&h=400&fit=crop&auto=format"],
      description: "Xe gia đình, một chủ từ đầu, bảo dưỡng định kỳ tại hãng.",
      seller: seller._id,
      sellerPhone: "0912 345 678",
      verified: true,
      views: 1234,
      badge: "Nổi bật",
      status: "active",
    },
    {
      name: "Mazda CX-5 2.0 Premium 2021",
      price: 875000000,
      year: 2021,
      km: 42000,
      fuel: "Xăng",
      transmission: "Tự động",
      location: "TP.HCM",
      brand: "Mazda",
      type: "SUV",
      images: ["https://images.unsplash.com/photo-1609521263047-f8f205293f24?w=600&h=400&fit=crop&auto=format"],
      description: "Nội thất còn mới, không mùi, không tai nạn.",
      seller: seller._id,
      sellerPhone: "0912 345 678",
      verified: true,
      views: 892,
      badge: "Hot",
      status: "active",
    },
    {
      name: "Honda CR-V 1.5 Turbo 2023",
      price: 1020000000,
      year: 2023,
      km: 15000,
      fuel: "Xăng",
      transmission: "Tự động",
      location: "Đà Nẵng",
      brand: "Honda",
      type: "SUV",
      images: ["https://images.unsplash.com/photo-1606664515524-ed2f786a0bd6?w=600&h=400&fit=crop&auto=format"],
      description: "Xe lướt, còn bảo hành hãng.",
      seller: seller._id,
      sellerPhone: "0912 345 678",
      verified: false,
      views: 567,
      badge: "Mới đăng",
      status: "pending",
    },
    {
      name: "Hyundai Tucson 2.0 ATH 2022",
      price: 745000000,
      year: 2022,
      km: 35000,
      fuel: "Xăng",
      transmission: "Tự động",
      location: "Hải Phòng",
      brand: "Hyundai",
      type: "SUV",
      images: ["https://images.unsplash.com/photo-1552519507-da3b142c6e3d?w=600&h=400&fit=crop&auto=format"],
      description: "Xe đẹp, đầy đủ tiện nghi.",
      seller: seller._id,
      sellerPhone: "0912 345 678",
      verified: true,
      views: 423,
      status: "active",
    },
    {
      name: "Ford Ranger Wildtrak 2.0 2023",
      price: 910000000,
      year: 2023,
      km: 12000,
      fuel: "Dầu",
      transmission: "Tự động",
      location: "Cần Thơ",
      brand: "Ford",
      type: "Bán tải",
      images: ["https://images.unsplash.com/photo-1558981033-0f0309284409?w=600&h=400&fit=crop&auto=format"],
      description: "Bán tải mạnh mẽ, phù hợp gia đình và công việc.",
      seller: seller._id,
      sellerPhone: "0912 345 678",
      verified: true,
      views: 678,
      badge: "Nổi bật",
      status: "active",
    },
    {
      name: "Kia Seltos 1.4 Turbo Premium 2022",
      price: 635000000,
      year: 2022,
      km: 29000,
      fuel: "Xăng",
      transmission: "Tự động",
      location: "Bình Dương",
      brand: "Kia",
      type: "SUV",
      images: ["https://images.unsplash.com/photo-1519641471654-76ce0107ad1b?w=600&h=400&fit=crop&auto=format"],
      description: "Xe nhỏ gọn, tiết kiệm nhiên liệu.",
      seller: seller._id,
      sellerPhone: "0912 345 678",
      verified: false,
      views: 312,
      status: "pending",
    },
  ];

  await CarModel.insertMany(cars);
  console.log(`🚗 Đã tạo ${cars.length} tin đăng mẫu.`);

  console.log("🎉 Seed dữ liệu hoàn tất!");
  void admin;
  await mongoose.disconnect();
}

seed().catch((err) => {
  console.error("❌ Lỗi khi seed dữ liệu:", err);
  process.exit(1);
});
