import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { ChatMessageReadEntity } from "entities/chat/chat-message-read.entity";
import { ChatMessageEntity } from "entities/chat/chat-message.entity";
import { ChatRoomMemberEntity } from "entities/chat/chat-room-member.entity";
import { Payload } from "src/auth/security/user.payload.interface";
import { Repository } from "typeorm";

@Injectable()
export class ChatReadMessageService {
  constructor(
    @InjectRepository(ChatRoomMemberEntity)
    private readonly memberRepo: Repository<ChatRoomMemberEntity>,
    @InjectRepository(ChatMessageEntity)
    private readonly messageRepo: Repository<ChatMessageEntity>,
    @InjectRepository(ChatMessageReadEntity)
    private readonly readRepo: Repository<ChatMessageReadEntity>,
  ) {}

  async getActiveMemberOrThrow(
    roomId: number,
    userUuid: string,
  ): Promise<ChatRoomMemberEntity> {
    const member = await this.memberRepo.findOne({
      where: { roomId, userUuid },
    });

    if (!member) throw new ForbiddenException("not member chat");
    if (member.leftDt) throw new ForbiddenException("already left chat");

    return member;
  }

  async markRead(user: Payload, roomId: number, messageId: number) {
    await this.getActiveMemberOrThrow(roomId, user.userUuid);

    const msg = await this.messageRepo.findOne({
      where: { id: messageId, roomId },
    });
    if (!msg) throw new NotFoundException("not exist message");

    /**
     * try/catch는 insert 쿼리에서 중복키 발생으로 주석처리
     */
    // try {
    const readMessageInfo = await this.readRepo.findOne({
      where: { messageId, userUuid: user.userUuid },
    });

    if (readMessageInfo) {
      await this.memberRepo
        .createQueryBuilder()
        .update(ChatRoomMemberEntity)
        .set({
          lastReadMessageId: () =>
            `GREATEST(COALESCE(lastReadMessageId,0), :messageId)`,
        })
        .where("roomId = :roomId", { roomId })
        .andWhere("userUuid = :userUuid", { userUuid: user.userUuid })
        .setParameter("messageId", messageId)
        .execute();
    } else {
      /**
       * readRepo를 활용해서 메시지 읽기처리 insert 방식으로 하게되면 insert row가 계속 쌓임
       * row가 많아지면 차후에 db read time이 늘어가 성능이슈 발생으로 chatMember에서 처리하는 방식으로 방향 수정
       * 현재는 하나의 row로 처리하는 방식으로 메시지를 읽은 적이 있으면 update를 하는 방식으로만 처리 하도록 진행
       */
      await this.readRepo.insert({
        messageId,
        userUuid: user.userUuid,
      });
      // } catch (err) {
      //   // duplicate key면 무시 (DB 에러 코드로 정교하게 분기해도 됨)
      // }
    }

    return { message: "success" };
  }
}
