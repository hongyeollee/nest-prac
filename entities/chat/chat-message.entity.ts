import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from "typeorm";
import { ChatRoomEntity } from "./chat-room.entity";
import { ChatMessageReadEntity } from "./chat-message-read.entity";

@Entity("chat_message")
@Index("idx_room_id", ["roomId", "id"])
export class ChatMessageEntity {
  @PrimaryGeneratedColumn("increment", {
    name: "id",
    type: "int",
    unsigned: true,
    comment: "채팅 메시지 고유 번호",
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
    name: "content",
    type: "text",
    nullable: true,
    comment: "채팅 내용",
  })
  content: string;

  @Column({
    name: "senderUserUuid",
    type: "varchar",
    nullable: false,
    comment: "보낸 사람 uuid",
  })
  senderUserUuid: string;

  @CreateDateColumn({
    name: "createdDt",
    type: "datetime",
    default: () => "CURRENT_TIMESTAMP(0)",
    nullable: false,
    comment: "채팅 메시지 생성 시간",
    precision: 0,
  })
  createdDt: Date;

  /**
   * 관계성
   */

  @ManyToOne(() => ChatRoomEntity, (room) => room.messages, {
    onDelete: "CASCADE",
  })
  @JoinColumn({ name: "roomId" })
  room: ChatRoomEntity;

  @OneToMany(() => ChatMessageReadEntity, (read) => read.message)
  readReceipts: ChatMessageReadEntity[];
}
