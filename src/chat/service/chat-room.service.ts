import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { ChatMessageEntity } from "entities/chat/chat-message.entity";
import { ChatRoomMemberEntity } from "entities/chat/chat-room-member.entity";
import { ChatRoomEntity } from "entities/chat/chat-room.entity";
import { Payload } from "src/auth/security/user.payload.interface";
import { DataSource, EntityManager, Repository } from "typeorm";
import { CreateRoomDTO } from "../dto/chat-room/create-room.dto";
import { ChatTypeEnum } from "../enum/chat-type.enum";
import { ChatRoleEnum } from "../enum/chat-role.enum";
import { InviteRoomDTO } from "../dto/chat-room/invite-room.dto";
import { MyRoomDTO } from "../dto/chat-room/my-room.dto";

@Injectable()
export class ChatRoomService {
  constructor(
    @InjectRepository(ChatRoomEntity)
    private readonly roomRepo: Repository<ChatRoomEntity>,
    @InjectRepository(ChatRoomMemberEntity)
    private readonly memberRepo: Repository<ChatRoomMemberEntity>,
    @InjectRepository(ChatMessageEntity)
    private readonly messageRepo: Repository<ChatMessageEntity>,

    private readonly dataSource: DataSource,
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

  async createRoom(
    user: Payload,
    createDto: CreateRoomDTO,
  ): Promise<ChatRoomEntity> {
    const members = Array.from(
      new Set<string>([user.userUuid, ...createDto.membersUuid]),
    );
    console.log("memebers ===> ", members);

    const transaction = await this.dataSource.transaction(
      async (manager: EntityManager) => {
        const createRoomInstance = manager.create(ChatRoomEntity, {
          roomType: createDto.roomType,
          name: createDto?.name ?? null, // 차후 개선 방법 고민 필요(대표 방 이름 or 개인 커스텀 별 제목(chatRoomEntity의 displayName으로) 반영 고민
          memberCount: members.length,
        });
        const saveRoom = await manager.save(ChatRoomEntity, createRoomInstance);

        const memberEntities = members.map((uuid) =>
          manager.create(ChatRoomMemberEntity, {
            roomId: saveRoom.id,
            userUuid: uuid,
            role:
              uuid === user.userUuid ? ChatRoleEnum.OWNER : ChatRoleEnum.MEMBER,
            isReadHistory: false,
          }),
        );

        await manager.insert(ChatRoomMemberEntity, memberEntities);

        return saveRoom;
      },
    );

    return transaction;
  }

  async getRoom(roomId: number, user: Payload): Promise<ChatRoomEntity> {
    // await this.getActiveMemberOrThrow(roomId, user.userUuid);
    //위 메소드가 꼭 필요한지 검토 필요

    const room = await this.roomRepo.findOne({ where: { id: roomId } });
    if (!room) throw new NotFoundException("not exist room");

    return room;
  }

  async inviteMember(
    roomId: number,
    inviteRoomDto: InviteRoomDTO,
    user: Payload,
  ): Promise<{
    added: number;
  }> {
    const { giveReadHistory, inviteUserUuid, membersUuid } = inviteRoomDto;
    await this.getActiveMemberOrThrow(roomId, inviteUserUuid);

    /**
     * 초대시 1:1(DM)대화에서 2명초과 초대인 경우는 예외처리
     */
    const room = await this.roomRepo.findOne({ where: { id: roomId } });
    if (room.roomType === ChatTypeEnum.DM)
      throw new BadRequestException("invalid invite");

    //초대하려는 유저가 과거 채팅내용을 볼 수 있는 사람인지 아닌지 확인
    const inviteUserMemberIsReadHistory: ChatRoomMemberEntity =
      await this.memberRepo.findOne({
        select: ["isReadHistory"],
        where: { roomId, userUuid: user.userUuid },
      });

    console.log(
      "초대하려는 유저가 과거 채팅내용을 볼 수 있는 사람인지 아닌지 확인",
      inviteUserMemberIsReadHistory,
    );

    const existed: ChatRoomMemberEntity[] = await this.memberRepo.find({
      where: membersUuid.map((userUuid) => ({
        roomId,
        userUuid,
      })),
    });
    const exitedUser: string[] = existed.map((el) => el.userUuid);

    const toAdd: string[] = membersUuid.filter(
      (userUuid) => !exitedUser.includes(userUuid),
    );
    if (toAdd.length === 0) return { added: 0 };

    const giveIsReadHistory: boolean =
      inviteUserMemberIsReadHistory.isReadHistory === true
        ? giveReadHistory
        : false;

    await this.dataSource.transaction(async (manager) => {
      await manager.insert(
        ChatRoomMemberEntity,
        toAdd.map((userUuid) => ({
          roomId,
          userUuid,
          role: ChatRoleEnum.MEMBER,
          isReadHistory: giveIsReadHistory,
          historyReadableDt:
            giveIsReadHistory === true ? () => "CURRENT_TIMESTAMP" : null,
        })),
      );

      await manager.update(
        ChatRoomEntity,
        { id: roomId },
        {
          memberCount: () => "memberCount + " + toAdd.length,
        },
      );
    });

    return {
      added: toAdd.length,
    };
  }

  async leaveRoom(
    roomId: number,
    user: Payload,
  ): Promise<{
    message: string;
  }> {
    const member = await this.memberRepo.findOne({
      where: { roomId, userUuid: user.userUuid },
    });
    if (!member) return { message: "none chat" };
    if (member.leftDt) return { message: "already leave" };

    const transaction = await this.dataSource.transaction(async (manager) => {
      await manager.update(
        ChatRoomMemberEntity,
        { id: member.id },
        { leftDt: new Date() },
      );

      await manager.update(
        ChatRoomEntity,
        { id: roomId },
        { memberCount: () => "memberCount - 1" },
      );

      return {
        message: "success",
      };
    });

    return transaction;
  }

  async getMyRooms(userUuid: string): Promise<MyRoomDTO[]> {
    // 나간 방 제외(leftDt is null)
    // + 마지막 메시지(방별 max id) 조인
    const rows = await this.memberRepo
      .createQueryBuilder("m")
      .innerJoin(ChatRoomEntity, "r", "r.id = m.roomId")
      .leftJoin(
        (qb) =>
          qb
            .select("cm.roomId", "roomId")
            .addSelect("MAX(cm.id)", "lastMessageId")
            .from(ChatMessageEntity, "cm")
            .groupBy("cm.roomId"),
        "lm",
        "lm.roomId = r.id",
      )
      .leftJoin(ChatMessageEntity, "msg", "msg.id = lm.lastMessageId")
      .addSelect((sq) => {
        return sq
          .select("COUNT(1)")
          .from(ChatMessageEntity, "u")
          .where("u.roomId = r.id")
          .andWhere("u.id > COALESCE(m.lastReadMessageId, 0)");
      }, "unreadCount")
      .where("m.userUuid = :userUuid", { userUuid })
      .andWhere("m.leftDt IS NULL")
      .select([
        "r.id AS roomId",
        "r.roomType AS roomType",
        "r.name AS name",
        "r.memberCount AS memberCount",
        "lm.lastMessageId AS lastMessageId",
        "msg.content AS lastMessageContent",
        "msg.createdDt AS lastMessageCreatedDt",
      ])
      // .orderBy("lm.lastMessageId", "DESC", "NULLS LAST") //mysql 방식 아님 하여 아래의 방식으로 사용
      .orderBy("lm.lastMessageId IS NULL", "ASC")
      .addOrderBy("lm.lastMessageId", "DESC")
      .getRawMany<{
        roomId: number;
        roomType: ChatTypeEnum;
        name: string | null;
        memberCount: number;
        lastMessageId: number | null;
        lastMessageContent: string | null;
        lastMessageCreatedDt: Date | null;
        unreadCount: string;
      }>();

    return rows.map((r) => ({
      roomId: Number(r.roomId),
      roomType: r.roomType,
      name: r.name,
      memberCount: Number(r.memberCount),
      lastMessageId: r.lastMessageId ? Number(r.lastMessageId) : null,
      lastMessageContent: r.lastMessageContent ?? null,
      lastMessageCreatedDt: r.lastMessageCreatedDt ?? null,
      unreadCount: Number(r.unreadCount ?? 0),
    }));
  }
}
