import { Module } from "@nestjs/common";
import { ChatGateway } from "./websocket/chat.gateway";
import { ChatRoomController } from "./controller/chat-room.controller";
import { ChatMessageController } from "./controller/chat-message.controller";
import { ChatReadMessageController } from "./controller/chat-read-message.controller";
import { ChatRoomService } from "./service/chat-room.service";
import { ChatMessageService } from "./service/chat-message.service";
import { ChatReadMessageService } from "./service/chat-read-message.service";
import { TypeOrmModule } from "@nestjs/typeorm";
import { ChatRoomEntity } from "entities/chat/chat-room.entity";
import { ChatRoomMemberEntity } from "entities/chat/chat-room-member.entity";
import { ChatMessageEntity } from "entities/chat/chat-message.entity";
import { ChatMessageReadEntity } from "entities/chat/chat-message-read.entity";
import { ChatEventService } from "./service/chat-event.service";
import { AuthMoudule } from "src/auth/auth.module";

@Module({
  imports: [
    TypeOrmModule.forFeature([
      ChatRoomEntity,
      ChatRoomMemberEntity,
      ChatMessageEntity,
      ChatMessageReadEntity,
    ]),
    AuthMoudule,
  ],
  controllers: [
    ChatRoomController,
    ChatMessageController,
    ChatReadMessageController,
  ],
  providers: [
    ChatGateway,
    ChatRoomService,
    ChatMessageService,
    ChatReadMessageService,
    ChatEventService,
  ],
})
export class ChatModule {}
