import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  UnauthorizedException,
} from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { JwtService } from "@nestjs/jwt";
import * as bcrypt from "bcrypt";
import { UsersService } from "../users/users.service";
import { MailService } from "../mail/mail.service";
import { RegisterDto } from "./dto/register.dto";
import { LoginDto } from "./dto/login.dto";
import { VerifyOtpDto } from "./dto/verify-otp.dto";
import { ResendOtpDto } from "./dto/resend-otp.dto";

function generateOtp(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
    private config: ConfigService,
    private mailService: MailService,
  ) {}

  private otpExpiryMinutes() {
    return this.config.get<number>("OTP_EXPIRES_MINUTES", 5);
  }

  private signToken(user: {
    _id: unknown;
    email: string;
    role: "user" | "admin";
  }) {
    return this.jwtService.sign({
      sub: user._id,
      email: user.email,
      role: user.role,
    });
  }

  private sanitizeUser(user: any) {
    const obj = typeof user.toObject === "function" ? user.toObject() : user;
    delete obj.passwordHash;
    delete obj.otpCode;
    delete obj.otpExpiresAt;
    return obj;
  }

  async register(dto: RegisterDto) {
    const user = await this.usersService.create(dto);

    const otp = generateOtp();
    user.otpCode = otp;
    user.otpExpiresAt = new Date(
      Date.now() + this.otpExpiryMinutes() * 60 * 1000,
    );
    await user.save();

    // Gửi OTP qua email thật
    await this.mailService.sendOtpEmail(
      user.email,
      otp,
      this.otpExpiryMinutes(),
    );

    return {
      message:
        "Đăng ký thành công. Vui lòng nhập mã OTP đã gửi tới email để xác thực tài khoản.",
      email: user.email,
    };
  }

  async verifyOtp(dto: VerifyOtpDto) {
    const user = await this.usersService.findByEmail(dto.email);
    if (!user)
      throw new BadRequestException("Không tìm thấy tài khoản với email này.");
    if (user.isVerified)
      throw new BadRequestException("Tài khoản đã được xác thực trước đó.");

    if (
      !user.otpCode ||
      !user.otpExpiresAt ||
      user.otpExpiresAt.getTime() < Date.now()
    ) {
      throw new BadRequestException(
        "Mã OTP đã hết hạn. Vui lòng gửi lại mã mới.",
      );
    }
    if (user.otpCode !== dto.otp) {
      throw new BadRequestException("Mã OTP không chính xác.");
    }

    user.isVerified = true;
    user.otpCode = undefined;
    user.otpExpiresAt = undefined;
    await user.save();

    const accessToken = this.signToken(user);
    return { accessToken, user: this.sanitizeUser(user) };
  }

  async resendOtp(dto: ResendOtpDto) {
    const user = await this.usersService.findByEmail(dto.email);
    if (!user)
      throw new BadRequestException("Không tìm thấy tài khoản với email này.");
    if (user.isVerified)
      throw new BadRequestException("Tài khoản đã được xác thực trước đó.");

    const otp = generateOtp();
    user.otpCode = otp;
    user.otpExpiresAt = new Date(
      Date.now() + this.otpExpiryMinutes() * 60 * 1000,
    );
    await user.save();

    // Gửi OTP qua email thật
    await this.mailService.sendOtpEmail(
      user.email,
      otp,
      this.otpExpiryMinutes(),
    );

    return { message: "Đã gửi lại mã OTP." };
  }

  async login(dto: LoginDto) {
    const user = await this.usersService.findByEmail(dto.email, true);
    if (!user)
      throw new UnauthorizedException("Email hoặc mật khẩu không đúng.");

    const matches = await bcrypt.compare(dto.password, user.passwordHash);
    if (!matches)
      throw new UnauthorizedException("Email hoặc mật khẩu không đúng.");

    if (!user.isVerified) {
      throw new ForbiddenException(
        "Tài khoản chưa xác thực OTP. Vui lòng kiểm tra email để xác thực.",
      );
    }
    if (user.status === "locked") {
      throw new ForbiddenException(
        "Tài khoản của bạn đã bị khóa. Vui lòng liên hệ quản trị viên.",
      );
    }

    const accessToken = this.signToken(user);
    return { accessToken, user: this.sanitizeUser(user) };
  }

  async me(userId: string) {
    const user = await this.usersService.findById(userId);
    return this.sanitizeUser(user);
  }
}
