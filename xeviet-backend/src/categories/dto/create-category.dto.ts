import { IsIn, IsOptional, IsString, MinLength } from "class-validator";
import { CategoryGroup } from "../schemas/category.schema";

export class CreateCategoryDto {
  @IsString()
  @MinLength(1)
  name: string;

  @IsIn(["brand", "carType", "model", "location"])
  group: CategoryGroup;

  @IsOptional()
  @IsString()
  colorHex?: string;

  @IsOptional()
  @IsString()
  imageUrl?: string;
}
