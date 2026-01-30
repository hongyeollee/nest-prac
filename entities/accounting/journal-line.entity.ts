import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from "typeorm";
import { AccountingLineSide } from "./accounting.enums";
import { AccountingJournalEntryEntity } from "./journal-entry.entity";

@Entity("accounting_journal_line")
export class AccountingJournalLineEntity {
  @PrimaryGeneratedColumn("increment", {
    name: "id",
    unsigned: true,
    comment: "분개 라인 고유아이디",
  })
  id: number;

  @Column("int", {
    name: "journalEntryId",
    unsigned: true,
    nullable: false,
    comment: "분개 고유아이디",
  })
  journalEntryId: number;

  @ManyToOne(
    () => AccountingJournalEntryEntity,
    (journalEntry) => journalEntry.lines,
    { nullable: false, onDelete: "CASCADE" },
  )
  @JoinColumn({ name: "journalEntryId" })
  journalEntry: AccountingJournalEntryEntity;

  @Column("varchar", {
    name: "account",
    length: 120,
    nullable: false,
    comment: "계정과목",
  })
  account: string;

  @Column("enum", {
    name: "side",
    enum: AccountingLineSide,
    nullable: false,
    comment: "차변/대변",
  })
  side: AccountingLineSide;

  @Column("decimal", {
    name: "amount",
    precision: 14,
    scale: 2,
    nullable: false,
    comment: "금액",
  })
  amount: string;

  @CreateDateColumn({
    type: "datetime",
    precision: 0,
    name: "createdDt",
    nullable: false,
    default: () => "CURRENT_TIMESTAMP(0)",
    comment: "라인 생성일",
  })
  createdDt: Date;
}
