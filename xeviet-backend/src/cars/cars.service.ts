import { ForbiddenException, Injectable, NotFoundException } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { FilterQuery, Model, Types } from "mongoose";
import { Car, CarDocument } from "./schemas/car.schema";
import { CreateCarDto } from "./dto/create-car.dto";
import { UpdateCarDto } from "./dto/update-car.dto";
import { QueryCarsDto } from "./dto/query-cars.dto";
import type { JwtPayloadUser } from "../auth/strategies/jwt.strategy";

@Injectable()
export class CarsService {
  constructor(@InjectModel(Car.name) private carModel: Model<CarDocument>) {}

  async create(sellerId: string, dto: CreateCarDto) {
    const created = new this.carModel({
      ...dto,
      seller: new Types.ObjectId(sellerId),
      status: "pending", // tin mới luôn chờ admin duyệt
    });
    return created.save();
  }

  /** Danh sách công khai — chỉ trả về tin đã được duyệt (status = active) */
  async findPublic(query: QueryCarsDto) {
    const filter: FilterQuery<CarDocument> = { status: "active" };
    this.applyCommonFilters(filter, query);
    return this.paginate(filter, query);
  }

  async findOnePublic(id: string) {
    if (!Types.ObjectId.isValid(id)) throw new NotFoundException("Xe không tồn tại.");
    const car = await this.carModel.findById(id).populate("seller", "name avatar verifiedSeller createdAt").exec();
    if (!car) throw new NotFoundException("Xe không tồn tại.");
    return car;
  }

  async incrementViews(id: string) {
    await this.carModel.findByIdAndUpdate(id, { $inc: { views: 1 } }).exec();
  }

  async findMine(sellerId: string, query: QueryCarsDto) {
    const filter: FilterQuery<CarDocument> = { seller: new Types.ObjectId(sellerId) };
    this.applyCommonFilters(filter, query);
    return this.paginate(filter, query);
  }

  async update(id: string, dto: UpdateCarDto, currentUser: JwtPayloadUser) {
    const car = await this.getOwnedOrAdmin(id, currentUser);
    Object.assign(car, dto);
    // Nếu chủ tin (không phải admin) sửa tin đã duyệt/từ chối, đưa lại về chờ duyệt
    if (currentUser.role !== "admin") {
      car.status = "pending";
    }
    await car.save();
    return car;
  }

  async remove(id: string, currentUser: JwtPayloadUser) {
    const car = await this.getOwnedOrAdmin(id, currentUser);
    await car.deleteOne();
    return { message: "Đã xóa tin đăng." };
  }

  private async getOwnedOrAdmin(id: string, currentUser: JwtPayloadUser) {
    if (!Types.ObjectId.isValid(id)) throw new NotFoundException("Xe không tồn tại.");
    const car = await this.carModel.findById(id).exec();
    if (!car) throw new NotFoundException("Xe không tồn tại.");

    const isOwner = car.seller.toString() === currentUser.userId;
    if (!isOwner && currentUser.role !== "admin") {
      throw new ForbiddenException("Bạn không có quyền thao tác trên tin đăng này.");
    }
    return car;
  }

  // ── Admin ─────────────────────────────────────────────────────────────

  async adminFindPending(query: QueryCarsDto) {
    const filter: FilterQuery<CarDocument> = { status: "pending" };
    this.applyCommonFilters(filter, query);
    return this.paginate(filter, query);
  }

  async adminFindAll(query: QueryCarsDto) {
    const filter: FilterQuery<CarDocument> = {};
    this.applyCommonFilters(filter, query);
    return this.paginate(filter, query);
  }

  async adminSetStatus(id: string, status: "active" | "rejected") {
    if (!Types.ObjectId.isValid(id)) throw new NotFoundException("Xe không tồn tại.");
    const car = await this.carModel.findByIdAndUpdate(id, { status }, { new: true }).exec();
    if (!car) throw new NotFoundException("Xe không tồn tại.");
    return car;
  }

  // ── Helpers ───────────────────────────────────────────────────────────

  private applyCommonFilters(filter: FilterQuery<CarDocument>, query: QueryCarsDto) {
    if (query.search) filter.$text = { $search: query.search };
    if (query.brand) filter.brand = query.brand;
    if (query.type) filter.type = query.type;
    if (query.location) filter.location = query.location;
    if (query.fuel) filter.fuel = query.fuel;
    if (query.transmission) filter.transmission = query.transmission;

    if (query.priceMin != null || query.priceMax != null) {
      filter.price = {};
      if (query.priceMin != null) filter.price.$gte = query.priceMin;
      if (query.priceMax != null) filter.price.$lte = query.priceMax;
    }
    if (query.yearMin != null || query.yearMax != null) {
      filter.year = {};
      if (query.yearMin != null) filter.year.$gte = query.yearMin;
      if (query.yearMax != null) filter.year.$lte = query.yearMax;
    }
  }

  private async paginate(filter: FilterQuery<CarDocument>, query: QueryCarsDto) {
    const page = query.page ?? 1;
    const limit = query.limit ?? 12;

    const sortMap: Record<string, Record<string, 1 | -1>> = {
      newest: { createdAt: -1 },
      price_asc: { price: 1 },
      price_desc: { price: -1 },
      most_viewed: { views: -1 },
    };
    const sort = sortMap[query.sort ?? "newest"];

    const [items, total] = await Promise.all([
      this.carModel
        .find(filter)
        .populate("seller", "name avatar verifiedSeller")
        .sort(sort)
        .skip((page - 1) * limit)
        .limit(limit)
        .exec(),
      this.carModel.countDocuments(filter).exec(),
    ]);

    return { items, total, page, limit, totalPages: Math.ceil(total / limit) || 1 };
  }
}
