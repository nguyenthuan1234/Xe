import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model, Types } from "mongoose";
import {
  Conversation,
  ConversationDocument,
} from "./schemas/conversation.schema";
import { Message, MessageDocument } from "./schemas/message.schema";
import { Car, CarDocument } from "../cars/schemas/car.schema";

@Injectable()
export class ConversationsService {
  constructor(
    @InjectModel(Conversation.name)
    private conversationModel: Model<ConversationDocument>,
    @InjectModel(Message.name) private messageModel: Model<MessageDocument>,
    @InjectModel(Car.name) private carModel: Model<CarDocument>,
  ) {}

  async startConversation(carId: string, buyerId: string) {
    if (!Types.ObjectId.isValid(carId))
      throw new BadRequestException("carId không hợp lệ.");
    const car = await this.carModel.findById(carId).exec();
    if (!car) throw new NotFoundException("Không tìm thấy xe.");

    if (car.seller.toString() === buyerId) {
      throw new BadRequestException(
        "Bạn không thể tự nhắn tin cho chính mình.",
      );
    }

    let conversation = await this.conversationModel
      .findOne({
        car: car._id,
        buyer: new Types.ObjectId(buyerId),
        seller: car.seller,
      })
      .exec();

    if (!conversation) {
      conversation = await this.conversationModel.create({
        car: car._id,
        buyer: new Types.ObjectId(buyerId),
        seller: car.seller,
      });
    }

    return this.conversationModel
      .findById(conversation._id)
      .populate("car", "name price images")
      .populate("buyer", "name avatar")
      .populate("seller", "name avatar")
      .exec();
  }

  async listMyConversations(userId: string) {
    const uid = new Types.ObjectId(userId);
    return this.conversationModel
      .find({ $or: [{ buyer: uid }, { seller: uid }] })
      .sort({ lastMessageAt: -1, updatedAt: -1 })
      .populate("car", "name price images")
      .populate("buyer", "name avatar")
      .populate("seller", "name avatar")
      .exec();
  }

  private async assertParticipant(conversationId: string, userId: string) {
    if (!Types.ObjectId.isValid(conversationId))
      throw new NotFoundException("Không tìm thấy cuộc trò chuyện.");
    const conversation = await this.conversationModel
      .findById(conversationId)
      .exec();
    if (!conversation)
      throw new NotFoundException("Không tìm thấy cuộc trò chuyện.");
    const isParticipant =
      conversation.buyer.toString() === userId ||
      conversation.seller.toString() === userId;
    if (!isParticipant)
      throw new ForbiddenException(
        "Bạn không có quyền truy cập cuộc trò chuyện này.",
      );
    return conversation;
  }

  async getMessages(conversationId: string, userId: string) {
    await this.assertParticipant(conversationId, userId);
    return this.messageModel
      .find({ conversation: new Types.ObjectId(conversationId) })
      .sort({ createdAt: 1 })
      .exec();
  }

  async sendMessage(conversationId: string, userId: string, content: string) {
    const conversation = await this.assertParticipant(conversationId, userId);
    const message = await this.messageModel.create({
      conversation: conversation._id,
      sender: new Types.ObjectId(userId),
      content,
    });
    conversation.lastMessage = content;
    conversation.lastMessageAt = new Date();
    await conversation.save();
    return message;
  }
}
