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
import { ChatMessageEntity } from "./chat-message.entity";

@Entity("chat_message_read")
@Unique("uq_message_user", ["messageId", "userUuid"])
@Index("idx_message", ["messageId"])
@Index("idx_user", ["userUuid"])
export class ChatMessageReadEntity {
  @PrimaryGeneratedColumn("increment", {
    name: "id",
    type: "int",
    unsigned: true,
    comment: "메시지 읽음 고유 번호",
  })
  id: number;

  @Column({
    name: "messageId",
    type: "int",
    unsigned: true,
    nullable: false,
    comment: "메시지 고유 번호",
  })
  messageId: number;

  @Column({
    name: "userUuid",
    type: "varchar",
    nullable: false,
    comment: "사용자의 uuid",
  })
  userUuid: string;

  @CreateDateColumn({
    name: "readDt",
    type: "datetime",
    precision: 0,
    comment: "읽은 시간",
    default: () => "CURRENT_TIMESTAMP(0)",
    nullable: false,
  })
  readDt: Date;

  /**
   * 관계성
   */
  @ManyToOne(() => ChatMessageEntity, (message) => message.readReceipts, {
    onDelete: "CASCADE",
  })
  @JoinColumn({ name: "messageId" })
  message: ChatMessageEntity;
}
