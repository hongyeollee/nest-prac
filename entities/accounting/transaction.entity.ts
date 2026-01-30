import {
  Column,
  CreateDateColumn,
  Entity,
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
    unique: true,
    nullable: false,
    comment: "노션 페이지 아이디",
  })
  notionPageId: string;

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
