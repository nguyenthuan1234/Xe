import { Body, Controller, Get, Param, Post, UseGuards } from "@nestjs/common";
import { ConversationsService } from "./conversations.service";
import { StartConversationDto } from "./dto/start-conversation.dto";
import { SendMessageDto } from "./dto/send-message.dto";
import { JwtAuthGuard } from "../common/guards/jwt-auth.guard";
import { CurrentUser } from "../common/decorators/current-user.decorator";
import type { JwtPayloadUser } from "../auth/strategies/jwt.strategy";

@UseGuards(JwtAuthGuard)
@Controller("conversations")
export class ConversationsController {
  constructor(private readonly conversationsService: ConversationsService) {}

  @Post("start")
  async start(
    @Body() dto: StartConversationDto,
    @CurrentUser() user: JwtPayloadUser,
  ) {
    return this.conversationsService.startConversation(dto.carId, user.userId);
  }

  @Get()
  async listMine(@CurrentUser() user: JwtPayloadUser) {
    return this.conversationsService.listMyConversations(user.userId);
  }

  @Get(":id/messages")
  async getMessages(
    @Param("id") id: string,
    @CurrentUser() user: JwtPayloadUser,
  ) {
    return this.conversationsService.getMessages(id, user.userId);
  }

  @Post(":id/messages")
  async sendMessage(
    @Param("id") id: string,
    @Body() dto: SendMessageDto,
    @CurrentUser() user: JwtPayloadUser,
  ) {
    return this.conversationsService.sendMessage(id, user.userId, dto.content);
  }
}
