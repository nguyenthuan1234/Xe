import { Type } from "class-transformer";
import { IsIn, IsInt, IsNumber, IsOptional, IsString, Min } from "class-validator";

export class QueryCarsDto {
  @IsOptional()
  @IsString()
  search?: string;

  @IsOptional()
  @IsString()
  brand?: string;

  @IsOptional()
  @IsString()
  type?: string;

  @IsOptional()
  @IsString()
  location?: string;

  @IsOptional()
  @IsString()
  fuel?: string;

  @IsOptional()
  @IsString()
  transmission?: string;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  priceMin?: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  priceMax?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  yearMin?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  yearMax?: number;

  @IsOptional()
  @IsIn(["newest", "price_asc", "price_desc", "most_viewed"])
  sort?: "newest" | "price_asc" | "price_desc" | "most_viewed" = "newest";

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number = 1;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  limit?: number = 12;
}
