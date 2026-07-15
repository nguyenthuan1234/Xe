import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document, Types } from "mongoose";

export type MessageDocument = Message & Document;

@Schema({ timestamps: true })
export class Message {
  @Prop({
    type: Types.ObjectId,
    ref: "Conversation",
    required: true,
    index: true,
  })
  conversation: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: "User", required: true })
  sender: Types.ObjectId;

  @Prop({ required: true, trim: true })
  content: string;
}

export const MessageSchema = SchemaFactory.createForClass(Message);
