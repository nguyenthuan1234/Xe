import { Body, Controller, Delete, Get, Param, Patch, Post, Query, UseGuards } from "@nestjs/common";
import { CarsService } from "./cars.service";
import { CreateCarDto } from "./dto/create-car.dto";
import { UpdateCarDto } from "./dto/update-car.dto";
import { QueryCarsDto } from "./dto/query-cars.dto";
import { JwtAuthGuard } from "../common/guards/jwt-auth.guard";
import { RolesGuard } from "../common/guards/roles.guard";
import { Roles } from "../common/decorators/roles.decorator";
import { CurrentUser } from "../common/decorators/current-user.decorator";
import type { JwtPayloadUser } from "../auth/strategies/jwt.strategy";

@Controller("cars")
export class CarsController {
  constructor(private readonly carsService: CarsService) {}

  // ── Công khai ─────────────────────────────────────────────────────────

  @Get()
  async findPublic(@Query() query: QueryCarsDto) {
    return this.carsService.findPublic(query);
  }

  // ── Người bán (đặt TRƯỚC ":id" để không bị nuốt route) ──────────────

  @UseGuards(JwtAuthGuard)
  @Get("mine")
  async findMine(@CurrentUser() user: JwtPayloadUser, @Query() query: QueryCarsDto) {
    return this.carsService.findMine(user.userId, query);
  }

  // ── Admin (đặt TRƯỚC ":id") ──────────────────────────────────────────

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles("admin")
  @Get("admin/pending")
  async adminFindPending(@Query() query: QueryCarsDto) {
    return this.carsService.adminFindPending(query);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles("admin")
  @Get("admin/all")
  async adminFindAll(@Query() query: QueryCarsDto) {
    return this.carsService.adminFindAll(query);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles("admin")
  @Patch(":id/approve")
  async approve(@Param("id") id: string) {
    return this.carsService.adminSetStatus(id, "active");
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles("admin")
  @Patch(":id/reject")
  async reject(@Param("id") id: string) {
    return this.carsService.adminSetStatus(id, "rejected");
  }

  // ── Chi tiết / CRUD ──────────────────────────────────────────────────

  @Get(":id")
  async findOne(@Param("id") id: string) {
    const car = await this.carsService.findOnePublic(id);
    // Tăng lượt xem — không cần chờ để phản hồi nhanh
    this.carsService.incrementViews(id).catch(() => undefined);
    return car;
  }

  @UseGuards(JwtAuthGuard)
  @Post()
  async create(@CurrentUser() user: JwtPayloadUser, @Body() dto: CreateCarDto) {
    return this.carsService.create(user.userId, dto);
  }

  @UseGuards(JwtAuthGuard)
  @Patch(":id")
  async update(@Param("id") id: string, @Body() dto: UpdateCarDto, @CurrentUser() user: JwtPayloadUser) {
    return this.carsService.update(id, dto, user);
  }

  @UseGuards(JwtAuthGuard)
  @Delete(":id")
  async remove(@Param("id") id: string, @CurrentUser() user: JwtPayloadUser) {
    return this.carsService.remove(id, user);
  }
}
