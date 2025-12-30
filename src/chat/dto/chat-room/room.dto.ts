import { ChatTypeEnum } from "src/chat/enum/chat-type.enum";

export class RoomDTO {
  id: number;
  roomType: ChatTypeEnum;
  name: string | null;
  memberCount: number;
  createdDt: Date;
}
