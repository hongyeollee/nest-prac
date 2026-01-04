import { ChatTypeEnum } from "src/chat/enum/chat-type.enum";

export class MyRoomDTO {
  roomId: number;
  roomType: ChatTypeEnum;
  name: string | null;
  memberCount: number;

  lastMessageId: number | null;
  lastMessageContent: string | null;
  lastMessageCreatedDt: Date | null;
}
