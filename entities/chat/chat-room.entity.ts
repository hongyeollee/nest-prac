import {
  Column,
  CreateDateColumn,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
} from "typeorm";
import { ChatRoomMemberEntity } from "./chat-room-member.entity";
import { ChatMessageEntity } from "./chat-message.entity";
import { ChatTypeEnum } from "./chat-type.enum";

@Entity("chat_room")
export class ChatRoomEntity {
  @PrimaryGeneratedColumn("increment", {
    name: "id",
    type: "int",
    unsigned: true,
    comment: "채팅 고유 번호",
  })
  id: number;

  @Column({
    name: "roomType",
    type: "enum",
    enum: ChatTypeEnum,
    nullable: false,
    comment: "채팅 방식(1:1 또는 그룹채팅)",
  })
  roomType: ChatTypeEnum;

  @Column({
    name: "name",
    type: "varchar",
    nullable: true,
    comment: "채팅방 이름",
  })
  name: string | null;

  @Column({
    name: "memberCount",
    type: "int",
    unsigned: true,
    nullable: false,
    comment: "채팅 참여 인원 수",
  })
  memberCount: number;

  @CreateDateColumn({
    name: "createdDt",
    type: "datetime",
    nullable: false,
    default: "CURRENT_TIMESTAMP",
    precision: 0,
    comment: "채팅 생성 시간",
  })
  createdDt: Date;

  /**
   * 관계성
   */

  @OneToMany(() => ChatRoomMemberEntity, (member) => member.room)
  members: ChatRoomMemberEntity[];

  @OneToMany(() => ChatMessageEntity, (message) => message.room)
  messages: ChatMessageEntity[];
}
