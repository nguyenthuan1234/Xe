import { CanActivate, ExecutionContext, ForbiddenException, Injectable } from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import type { Request } from "express";
import { ROLES_KEY, AppRole } from "../decorators/roles.decorator";
import type { JwtPayloadUser } from "../../auth/strategies/jwt.strategy";

/**
 * Chặn truy cập nếu user.role không nằm trong danh sách @Roles(...) khai báo.
 * PHẢI dùng SAU JwtAuthGuard để request.user đã tồn tại:
 * @UseGuards(JwtAuthGuard, RolesGuard)
 * @Roles("admin")
 */
@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<AppRole[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (!requiredRoles || requiredRoles.length === 0) return true;

    const request = context.switchToHttp().getRequest<Request & { user: JwtPayloadUser }>();
    const user = request.user;

    if (!user || !requiredRoles.includes(user.role)) {
      throw new ForbiddenException("Bạn không có quyền thực hiện thao tác này.");
    }
    return true;
  }
}
