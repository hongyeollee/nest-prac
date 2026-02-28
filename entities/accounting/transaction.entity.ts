import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from "typeorm";
import {
  AccountingTransactionStatus,
  AccountingTransactionType,
  AccountingVatType,
} from "./accounting.enums";
import { AccountingJournalEntryEntity } from "./journal-entry.entity";

@Entity("accounting_transaction")
@Index("idx_accounting_transaction_notionPageId", ["notionPageId"])
export class AccountingTransactionEntity {
  @PrimaryGeneratedColumn("increment", {
    name: "id",
    unsigned: true,
    comment: "거래 고유아이디",
  })
  id: number;

  @Column("varchar", {
    name: "notionPageId",
    length: 128,
    nullable: false,
    comment: "노션 페이지 아이디",
  })
  notionPageId: string;

  @Column("int", {
    name: "revision",
    unsigned: true,
    nullable: false,
    default: 1,
    comment: "정정 버전",
  })
  revision: number;

  @Column("int", {
    name: "correctedFromId",
    unsigned: true,
    nullable: true,
    comment: "정정 원거래 아이디",
  })
  correctedFromId: number | null;

  @Column("varchar", {
    name: "correctionReason",
    length: 500,
    nullable: true,
    comment: "정정 사유",
  })
  correctionReason: string | null;

  @Column("varchar", {
    name: "cancellationReason",
    length: 500,
    nullable: true,
    comment: "취소 사유",
  })
  cancellationReason: string | null;

  @Column("datetime", {
    name: "notionLastEditedAt",
    precision: 0,
    nullable: true,
    comment: "노션 최종 수정일",
  })
  notionLastEditedAt: Date | null;

  @Column("date", {
    name: "date",
    nullable: false,
    comment: "거래 날짜",
  })
  date: Date;

  @Column("enum", {
    name: "type",
    enum: AccountingTransactionType,
    nullable: false,
    comment: "거래 유형",
  })
  type: AccountingTransactionType;

  @Column("decimal", {
    name: "amount",
    precision: 14,
    scale: 2,
    nullable: false,
    comment: "거래 금액",
  })
  amount: string;

  @Column("boolean", {
    name: "amountIncludesVat",
    nullable: false,
    default: true,
    comment: "부가세 포함 여부",
  })
  amountIncludesVat: boolean;

  @Column("enum", {
    name: "vatType",
    enum: AccountingVatType,
    nullable: false,
    default: AccountingVatType.Taxable,
    comment: "부가세 유형",
  })
  vatType: AccountingVatType;

  @Column("varchar", {
    name: "category",
    length: 100,
    nullable: false,
    comment: "분류",
  })
  category: string;

  @Column("varchar", {
    name: "counterparty",
    length: 150,
    nullable: true,
    comment: "거래처",
  })
  counterparty: string | null;

  @Column("varchar", {
    name: "memo",
    length: 500,
    nullable: true,
    comment: "메모",
  })
  memo: string | null;

  @Column("enum", {
    name: "status",
    enum: AccountingTransactionStatus,
    nullable: false,
    default: AccountingTransactionStatus.Ready,
    comment: "처리 상태",
  })
  status: AccountingTransactionStatus;

  @Column("varchar", {
    name: "error",
    length: 500,
    nullable: true,
    comment: "에러 메시지",
  })
  error: string | null;

  @CreateDateColumn({
    type: "datetime",
    precision: 0,
    name: "createdDt",
    nullable: false,
    default: () => "CURRENT_TIMESTAMP(0)",
    comment: "거래 데이터 생성일",
  })
  createdDt: Date;

  @UpdateDateColumn({
    type: "datetime",
    precision: 0,
    name: "updatedDt",
    nullable: true,
    default: () => "CURRENT_TIMESTAMP(0)",
    onUpdate: "CURRENT_TIMESTAMP(0)",
    comment: "거래 데이터 수정일",
  })
  updatedDt: Date;

  @OneToMany(
    () => AccountingJournalEntryEntity,
    (journalEntry) => journalEntry.transaction,
  )
  journalEntries: AccountingJournalEntryEntity[];
}
