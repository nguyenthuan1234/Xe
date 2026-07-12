import { Injectable } from "@nestjs/common";
import { AuthGuard } from "@nestjs/passport";

/**
 * Bảo vệ route yêu cầu đăng nhập (Bearer token hợp lệ).
 * Dùng: @UseGuards(JwtAuthGuard)
 */
@Injectable()
export class JwtAuthGuard extends AuthGuard("jwt") {}
