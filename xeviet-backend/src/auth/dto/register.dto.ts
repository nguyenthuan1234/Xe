import { IsEmail, IsString, MinLength } from "class-validator";

export class RegisterDto {
  @IsString()
  @MinLength(2, { message: "Họ và tên phải có ít nhất 2 ký tự." })
  name: string;

  @IsEmail({}, { message: "Email không hợp lệ." })
  email: string;

  @IsString()
  @MinLength(9, { message: "Số điện thoại không hợp lệ." })
  phone: string;

  @IsString()
  @MinLength(8, { message: "Mật khẩu phải có ít nhất 8 ký tự." })
  password: string;
}
