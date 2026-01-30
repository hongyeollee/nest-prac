import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from "typeorm";
import { AccountingJournalLineEntity } from "./journal-line.entity";
import { AccountingTransactionEntity } from "./transaction.entity";

@Entity("accounting_journal_entry")
export class AccountingJournalEntryEntity {
  @PrimaryGeneratedColumn("increment", {
    name: "id",
    unsigned: true,
    comment: "분개 고유아이디",
  })
  id: number;

  @Column("int", {
    name: "transactionId",
    unsigned: true,
    nullable: false,
    comment: "거래 고유아이디",
  })
  transactionId: number;

  @ManyToOne(
    () => AccountingTransactionEntity,
    (transaction) => transaction.journalEntries,
    { nullable: false },
  )
  @JoinColumn({ name: "transactionId" })
  transaction: AccountingTransactionEntity;

  @Column("boolean", {
    name: "isBalanced",
    nullable: false,
    default: false,
    comment: "차변/대변 일치 여부",
  })
  isBalanced: boolean;

  @Column("varchar", {
    name: "memo",
    length: 500,
    nullable: true,
    comment: "분개 메모",
  })
  memo: string | null;

  @OneToMany(() => AccountingJournalLineEntity, (line) => line.journalEntry, {
    cascade: true,
  })
  lines: AccountingJournalLineEntity[];

  @CreateDateColumn({
    type: "datetime",
    precision: 0,
    name: "createdDt",
    nullable: false,
    default: () => "CURRENT_TIMESTAMP(0)",
    comment: "분개 데이터 생성일",
  })
  createdDt: Date;
}
