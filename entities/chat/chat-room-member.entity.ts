import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  Unique,
} from "typeorm";
import { ChatRoleEnum } from "../../src/chat/enum/chat-role.enum";
import { ChatRoomEntity } from "./chat-room.entity";

@Entity("chat_room_member")
@Unique("uq_room_user", ["roomId", "userUuid"])
@Index("idx_room", ["roomId"])
@Index("idx_user", ["userUuid"])
export class ChatRoomMemberEntity {
  @PrimaryGeneratedColumn("increment", {
    name: "id",
    type: "int",
    unsigned: true,
    comment: "채팅 멤버 고유 번호",
  })
  id: number;

  @Column({
    name: "roomId",
    type: "int",
    unsigned: true,
    nullable: false,
    comment: "채팅 고유 번호",
  })
  roomId: number;

  @Column({
    name: "userUuid",
    type: "varchar",
    nullable: false,
    comment: "채팅에 참여한 회원 uuid",
  })
  userUuid: string;

  @Column({
    name: "role",
    type: "enum",
    enum: ChatRoleEnum,
    nullable: false,
    default: ChatRoleEnum.MEMBER,
    comment: "채팅 참여 권한",
  })
  role: ChatRoleEnum;

  @Column({
    name: "isReadHistory",
    type: "tinyint",
    width: 1,
    default: 0,
    nullable: false,
    comment: "과거 채팅 읽기 가능 허용 여부",
  })
  isReadHistory: boolean;

  @Column({
    name: "historyReadableDt",
    type: "datetime",
    nullable: true,
    precision: 0,
    comment: "과거 채팅 읽기 가능 여부 기준 시간",
  })
  historyReadableDt: Date | null;

  @CreateDateColumn({
    name: "joinedDt",
    type: "datetime",
    nullable: false,
    default: () => "CURRENT_TIMESTAMP(0)",
    precision: 0,
    comment: "채팅 참여 일시",
  })
  joinedDt: Date;

  @Column({
    name: "leftDt",
    type: "datetime",
    nullable: true,
    precision: 0,
    comment: "채팅 나감 일시",
  })
  leftDt: Date | null;

  /**
   * 관계성
   */

  @ManyToOne(() => ChatRoomEntity, (room) => room.members, {
    onDelete: "CASCADE",
  })
  @JoinColumn({ name: "roomId" })
  room: ChatRoomEntity;
}
