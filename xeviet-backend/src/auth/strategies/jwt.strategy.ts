import { Injectable, UnauthorizedException } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { PassportStrategy } from "@nestjs/passport";
import { ExtractJwt, Strategy } from "passport-jwt";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { User, UserDocument } from "../../users/schemas/user.schema";

export interface JwtPayload {
  sub: string;
  email: string;
  role: "user" | "admin";
}

export interface JwtPayloadUser {
  userId: string;
  email: string;
  role: "user" | "admin";
}

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    config: ConfigService,
    @InjectModel(User.name) private userModel: Model<UserDocument>,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: config.get<string>("JWT_SECRET", "dev-secret"),
    });
  }

  /**
   * Được gọi tự động sau khi JWT hợp lệ về mặt chữ ký/hạn dùng.
   * Kiểm tra thêm user còn tồn tại & không bị khóa trước khi cho qua.
   */
  async validate(payload: JwtPayload): Promise<JwtPayloadUser> {
    const user = await this.userModel.findById(payload.sub).exec();
    if (!user) throw new UnauthorizedException("Tài khoản không tồn tại.");
    if (user.status === "locked") throw new UnauthorizedException("Tài khoản của bạn đã bị khóa.");

    return { userId: user._id.toString(), email: user.email, role: user.role };
  }
}
