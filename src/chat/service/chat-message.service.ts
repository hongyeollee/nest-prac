import { ForbiddenException, Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { ChatMessageEntity } from "entities/chat/chat-message.entity";
import { ChatRoomMemberEntity } from "entities/chat/chat-room-member.entity";
import { Payload } from "src/auth/security/user.payload.interface";
import { Repository } from "typeorm";

type CursorPage<T> = {
  items: T[];
  nextCoursor: number | null;
  hasNext: boolean;
};

@Injectable()
export class ChatMessageService {
  constructor(
    @InjectRepository(ChatMessageEntity)
    private readonly messageRepo: Repository<ChatMessageEntity>,
    @InjectRepository(ChatRoomMemberEntity)
    private readonly memberRepo: Repository<ChatRoomMemberEntity>,
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

  async createMessage(
    roomId: number,
    userUuid: string,
    content: string,
    user?: Payload,
  ): Promise<ChatMessageEntity> {
    userUuid = user ? user.userUuid : userUuid;

    const createMsgInstance = await this.messageRepo.create({
      roomId,
      senderUserUuid: userUuid,
      content,
    });

    return await this.messageRepo.save(createMsgInstance);
  }

  async getMessageByCursor(
    user: Payload,
    roomId: number,
    cursor?: number,
    limit: number = 20,
  ) {
    const member = await this.getActiveMemberOrThrow(roomId, user.userUuid);

    const qb = this.messageRepo
      .createQueryBuilder("msg")
      .where("msg.roomId = :roomId", { roomId });
    if (!member.isReadHistory) {
      qb.andWhere("msg.createdDt >= :joinedDt", { joinedDt: member.joinedDt });
    }
    if (cursor) {
      qb.andWhere("msg.id < :cursor", { cursor });
    }

    const rows = await qb
      .orderBy("msg.id", "DESC")
      .take(limit + 1)
      .getMany();

    const hasNext = rows.length > limit;
    const items = hasNext ? rows.slice(0, limit) : rows;
    const nextCursor = hasNext ? items[items.length - 1].id : null;

    return {
      items,
      hasNext,
      nextCursor,
    };
  }
}
