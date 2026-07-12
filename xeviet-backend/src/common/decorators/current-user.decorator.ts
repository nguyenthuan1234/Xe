import { createParamDecorator, ExecutionContext } from "@nestjs/common";
import type { Request } from "express";
import type { JwtPayloadUser } from "../../auth/strategies/jwt.strategy";

/**
 * Lấy user hiện tại (đã gắn vào request bởi JwtAuthGuard) trong controller:
 * `@CurrentUser() user: JwtPayloadUser`
 */
export const CurrentUser = createParamDecorator((_data: unknown, ctx: ExecutionContext): JwtPayloadUser => {
  const request = ctx.switchToHttp().getRequest<Request & { user: JwtPayloadUser }>();
  return request.user;
});
