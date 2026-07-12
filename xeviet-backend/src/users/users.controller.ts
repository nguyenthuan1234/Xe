import { Body, Controller, Delete, Get, Param, Patch, Post, Query, UseGuards } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { UsersService } from "./users.service";
import { UpdateProfileDto } from "./dto/update-profile.dto";
import { ChangePasswordDto } from "./dto/change-password.dto";
import { AdminUpdateUserDto } from "./dto/admin-update-user.dto";
import { QueryUsersDto } from "./dto/query-users.dto";
import { JwtAuthGuard } from "../common/guards/jwt-auth.guard";
import { RolesGuard } from "../common/guards/roles.guard";
import { Roles } from "../common/decorators/roles.decorator";
import { CurrentUser } from "../common/decorators/current-user.decorator";
import type { JwtPayloadUser } from "../auth/strategies/jwt.strategy";
import { Car, CarDocument } from "../cars/schemas/car.schema";

@Controller("users")
export class UsersController {
  constructor(
    private readonly usersService: UsersService,
    @InjectModel(Car.name) private carModel: Model<CarDocument>,
  ) {}

  // ── Chính người dùng tự quản lý ("me") ───────────────────────────────

  @UseGuards(JwtAuthGuard)
  @Get("me")
  async getMe(@CurrentUser() currentUser: JwtPayloadUser) {
    return this.usersService.findById(currentUser.userId);
  }

  @UseGuards(JwtAuthGuard)
  @Patch("me")
  async updateMe(@CurrentUser() currentUser: JwtPayloadUser, @Body() dto: UpdateProfileDto) {
    return this.usersService.updateProfile(currentUser.userId, dto);
  }

  @UseGuards(JwtAuthGuard)
  @Patch("me/password")
  async changeMyPassword(@CurrentUser() currentUser: JwtPayloadUser, @Body() dto: ChangePasswordDto) {
    return this.usersService.changePassword(currentUser.userId, dto);
  }

  @UseGuards(JwtAuthGuard)
  @Post("me/favorites/:carId")
  async toggleFavorite(@CurrentUser() currentUser: JwtPayloadUser, @Param("carId") carId: string) {
    return this.usersService.toggleFavorite(currentUser.userId, carId);
  }

  @UseGuards(JwtAuthGuard)
  @Get("me/favorites")
  async getMyFavorites(@CurrentUser() currentUser: JwtPayloadUser) {
    const ids = await this.usersService.getFavoriteIds(currentUser.userId);
    return this.carModel.find({ _id: { $in: ids } }).sort({ createdAt: -1 }).exec();
  }

  // ── Admin ─────────────────────────────────────────────────────────────

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles("admin")
  @Get()
  async adminList(@Query() query: QueryUsersDto) {
    return this.usersService.adminList(query);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles("admin")
  @Get(":id")
  async adminGetOne(@Param("id") id: string) {
    return this.usersService.findById(id);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles("admin")
  @Patch(":id")
  async adminUpdate(
    @Param("id") id: string,
    @Body() dto: AdminUpdateUserDto,
    @CurrentUser() currentUser: JwtPayloadUser,
  ) {
    return this.usersService.adminUpdate(id, dto, currentUser.userId);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles("admin")
  @Delete(":id")
  async adminDelete(@Param("id") id: string, @CurrentUser() currentUser: JwtPayloadUser) {
    return this.usersService.adminDelete(id, currentUser.userId);
  }
}
