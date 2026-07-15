import { IsMongoId } from "class-validator";

export class StartConversationDto {
  @IsMongoId()
  carId: string;
}
