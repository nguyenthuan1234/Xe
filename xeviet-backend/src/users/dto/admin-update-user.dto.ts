import { IsIn, IsOptional, IsString } from "class-validator";

export class AdminUpdateUserDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsIn(["user", "admin"])
  role?: "user" | "admin";

  @IsOptional()
  @IsIn(["active", "locked"])
  status?: "active" | "locked";
}
