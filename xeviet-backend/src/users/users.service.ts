import { BadRequestException, ForbiddenException, Injectable, NotFoundException } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model, Types } from "mongoose";
import * as bcrypt from "bcrypt";
import { User, UserDocument } from "./schemas/user.schema";
import { UpdateProfileDto } from "./dto/update-profile.dto";
import { ChangePasswordDto } from "./dto/change-password.dto";
import { AdminUpdateUserDto } from "./dto/admin-update-user.dto";
import { QueryUsersDto } from "./dto/query-users.dto";

@Injectable()
export class UsersService {
  constructor(@InjectModel(User.name) private userModel: Model<UserDocument>) {}

  async findByEmail(email: string, withPassword = false) {
    const query = this.userModel.findOne({ email: email.toLowerCase().trim() });
    if (withPassword) query.select("+passwordHash");
    return query.exec();
  }

  async findById(id: string) {
    const user = await this.userModel.findById(id).exec();
    if (!user) throw new NotFoundException("Không tìm thấy người dùng.");
    return user;
  }

  async create(data: { name: string; email: string; phone: string; password: string }) {
    const existing = await this.findByEmail(data.email);
    if (existing) throw new BadRequestException("Email này đã được đăng ký.");

    const passwordHash = await bcrypt.hash(data.password, 10);
    const created = new this.userModel({
      name: data.name,
      email: data.email.toLowerCase().trim(),
      phone: data.phone,
      passwordHash,
    });
    return created.save();
  }

  async updateProfile(userId: string, dto: UpdateProfileDto) {
    const user = await this.findById(userId);
    Object.assign(user, dto);
    await user.save();
    return user;
  }

  async changePassword(userId: string, dto: ChangePasswordDto) {
    const user = await this.userModel.findById(userId).select("+passwordHash").exec();
    if (!user) throw new NotFoundException("Không tìm thấy người dùng.");

    const matches = await bcrypt.compare(dto.currentPassword, user.passwordHash);
    if (!matches) throw new BadRequestException("Mật khẩu hiện tại không đúng.");

    user.passwordHash = await bcrypt.hash(dto.newPassword, 10);
    await user.save();
    return { message: "Đổi mật khẩu thành công." };
  }

  async toggleFavorite(userId: string, carId: string) {
    if (!Types.ObjectId.isValid(carId)) throw new BadRequestException("carId không hợp lệ.");
    const user = await this.findById(userId);
    const objectId = new Types.ObjectId(carId);
    const idx = user.favoriteCarIds.findIndex((id) => id.equals(objectId));

    if (idx >= 0) {
      user.favoriteCarIds.splice(idx, 1);
    } else {
      user.favoriteCarIds.push(objectId);
    }
    await user.save();
    return { favorited: idx < 0, favoriteCarIds: user.favoriteCarIds };
  }

  async getFavoriteIds(userId: string) {
    const user = await this.findById(userId);
    return user.favoriteCarIds;
  }

  // ── Admin ──────────────────────────────────────────────────────────────

  async adminList(query: QueryUsersDto) {
    const page = query.page ?? 1;
    const limit = query.limit ?? 20;
    const filter: Record<string, unknown> = {};

    if (query.role) filter.role = query.role;
    if (query.status) filter.status = query.status;
    if (query.search) {
      const regex = new RegExp(query.search, "i");
      filter.$or = [{ name: regex }, { email: regex }, { phone: regex }];
    }

    const [items, total] = await Promise.all([
      this.userModel
        .find(filter)
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .exec(),
      this.userModel.countDocuments(filter).exec(),
    ]);

    return { items, total, page, limit, totalPages: Math.ceil(total / limit) };
  }

  async adminUpdate(id: string, dto: AdminUpdateUserDto, actingAdminId: string) {
    if (id === actingAdminId && (dto.role === "user" || dto.status === "locked")) {
      throw new ForbiddenException("Bạn không thể tự hạ quyền hoặc tự khóa chính mình.");
    }
    const user = await this.findById(id);
    Object.assign(user, dto);
    await user.save();
    return user;
  }

  async adminDelete(id: string, actingAdminId: string) {
    if (id === actingAdminId) {
      throw new ForbiddenException("Bạn không thể tự xóa tài khoản của chính mình.");
    }
    const result = await this.userModel.findByIdAndDelete(id).exec();
    if (!result) throw new NotFoundException("Không tìm thấy người dùng.");
    return { message: "Đã xóa tài khoản." };
  }
}
