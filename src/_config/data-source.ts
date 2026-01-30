// migration 용도 data-source.ts
import "dotenv/config";
import { DataSource } from "typeorm";
import { UserEntity } from "../../entities/user.entity";
import { PostEntity } from "../../entities/post.entity";
import { CouponEntity } from "../../entities/coupons/coupon.entity";
import { CouponIssuedEntity } from "../../entities/coupons/coupon-issued.entity";
import { CouponIssuedLogEntity } from "../../entities/coupons/coupon-issued-log.entity";
import { PostLikeEntity } from "entities/post-like.entity";
import { ChatRoomEntity } from "entities/chat/chat-room.entity";
import { ChatRoomMemberEntity } from "entities/chat/chat-room-member.entity";
import { ChatMessageEntity } from "entities/chat/chat-message.entity";
import { ChatMessageReadEntity } from "entities/chat/chat-message-read.entity";
import { AccountingTransactionEntity } from "entities/accounting/transaction.entity";
import { AccountingRuleEntity } from "entities/accounting/rule.entity";
import { AccountingJournalEntryEntity } from "entities/accounting/journal-entry.entity";
import { AccountingJournalLineEntity } from "entities/accounting/journal-line.entity";

export const AppDataSource = new DataSource({
  type: "mysql",
  host: process.env.DB_HOST || "localhost",
  port: 3306,
  username: process.env.DB_USER_NAME || "root",
  password: process.env.DB_PASSWORD || "ghdfuf2",
  database: "nest_prac",
  timezone: "Z",
  synchronize: false,
  logging: true,
  entities: [
    UserEntity,
    PostEntity,
    CouponEntity,
    CouponIssuedEntity,
    CouponIssuedLogEntity,
    PostLikeEntity,
    ChatRoomEntity,
    ChatRoomMemberEntity,
    ChatMessageEntity,
    ChatMessageReadEntity,
    AccountingTransactionEntity,
    AccountingRuleEntity,
    AccountingJournalEntryEntity,
    AccountingJournalLineEntity,
  ],
  migrationsRun: false,
  migrations:
    process.env.NODE_ENV === "production"
      ? ["dist/src/_migrations/*.js"]
      : ["src/_migrations/*.ts"],
});
