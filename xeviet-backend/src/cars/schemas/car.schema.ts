import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document, Types } from "mongoose";

export type CarDocument = Car & Document;

@Schema({ timestamps: true })
export class Car {
  @Prop({ required: true, trim: true })
  name: string;

  @Prop({ required: true })
  price: number; // lưu bằng VNĐ, số nguyên — FE tự format hiển thị

  @Prop({ required: true })
  year: number;

  @Prop({ required: true })
  km: number;

  @Prop({ required: true })
  fuel: string; // "Xăng" | "Dầu" | "Hybrid" | "Điện"

  @Prop({ required: true })
  transmission: string; // "Tự động" | "Số sàn" | "Bán tự động"

  @Prop({ required: true })
  location: string;

  @Prop({ required: true })
  brand: string;

  @Prop({ required: true })
  type: string; // "Sedan" | "SUV" | "Hatchback" | "Pickup" | "MPV" ...

  @Prop({ type: [String], default: [] })
  images: string[];

  @Prop()
  videoUrl?: string;

  @Prop({ default: "" })
  description: string;

  @Prop({ type: Types.ObjectId, ref: "User", required: true, index: true })
  seller: Types.ObjectId;

  @Prop({ required: true })
  sellerPhone: string;

  @Prop({ default: false })
  verified: boolean;

  @Prop({ default: 0 })
  views: number;

  @Prop({ enum: ["pending", "active", "rejected"], default: "pending", index: true })
  status: "pending" | "active" | "rejected";

  @Prop()
  badge?: string; // "Nổi bật" | "Hot" | "Mới đăng"

  @Prop({ type: Object, default: {} })
  condition?: Record<string, string>; // { "Ngoại thất": "Tốt", ... }

  @Prop({ type: Object, default: {} })
  legalInfo?: Record<string, string>; // { "Biển số": "...", "Đăng kiểm": "..." }
}

export const CarSchema = SchemaFactory.createForClass(Car);

CarSchema.index({ name: "text", brand: "text", type: "text", description: "text" });
