import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document } from "mongoose";

export type CategoryGroup = "brand" | "carType" | "model" | "location";
export type CategoryDocument = Category & Document;

@Schema({ timestamps: true })
export class Category {
  @Prop({ required: true, trim: true })
  name: string;

  @Prop({ required: true, enum: ["brand", "carType", "model", "location"], index: true })
  group: CategoryGroup;

  // Dùng cho hãng xe: màu thương hiệu hiển thị ở trang chủ (vd "#EB0A1E")
  @Prop()
  colorHex?: string;

  // Dùng cho hãng xe: ảnh logo thương hiệu (đường dẫn trả về từ /uploads)
  @Prop()
  imageUrl?: string;
}

export const CategorySchema = SchemaFactory.createForClass(Category);
CategorySchema.index({ group: 1, name: 1 }, { unique: true });
