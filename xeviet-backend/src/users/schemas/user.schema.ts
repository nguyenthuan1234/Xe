import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document, Types } from "mongoose";

export type UserDocument = User & Document;

@Schema({ timestamps: true })
export class User {
  @Prop({ required: true, trim: true })
  name: string;

  @Prop({ required: true, unique: true, lowercase: true, trim: true, index: true })
  email: string;

  @Prop({ required: true, trim: true })
  phone: string;

  @Prop({ required: true, select: false })
  passwordHash: string;

  @Prop({ enum: ["user", "admin"], default: "user" })
  role: "user" | "admin";

  @Prop({ enum: ["active", "locked"], default: "active" })
  status: "active" | "locked";

  @Prop({ default: false })
  isVerified: boolean;

  @Prop({ default: false })
  verifiedSeller: boolean;

  @Prop()
  otpCode?: string;

  @Prop()
  otpExpiresAt?: Date;

  @Prop()
  avatar?: string;

  @Prop()
  dateOfBirth?: Date;

  @Prop()
  province?: string;

  @Prop({ type: [{ type: Types.ObjectId, ref: "Car" }], default: [] })
  favoriteCarIds: Types.ObjectId[];
}

export const UserSchema = SchemaFactory.createForClass(User);
