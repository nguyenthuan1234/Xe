import { Type } from "class-transformer";
import { IsArray, IsIn, IsNumber, IsObject, IsOptional, IsString, Min, MinLength } from "class-validator";

export class CreateCarDto {
  @IsString()
  @MinLength(3)
  name: string;

  @Type(() => Number)
  @IsNumber()
  @Min(0)
  price: number;

  @Type(() => Number)
  @IsNumber()
  @Min(1980)
  year: number;

  @Type(() => Number)
  @IsNumber()
  @Min(0)
  km: number;

  @IsString()
  fuel: string;

  @IsString()
  transmission: string;

  @IsString()
  location: string;

  @IsString()
  brand: string;

  @IsString()
  type: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  images?: string[];

  @IsOptional()
  @IsString()
  videoUrl?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsString()
  sellerPhone: string;

  @IsOptional()
  @IsIn(["Nổi bật", "Hot", "Mới đăng"])
  badge?: string;

  @IsOptional()
  @IsObject()
  condition?: Record<string, string>;

  @IsOptional()
  @IsObject()
  legalInfo?: Record<string, string>;
}
