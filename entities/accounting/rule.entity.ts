import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from "typeorm";
import {
  AccountingTransactionType,
  AccountingVatMode,
} from "./accounting.enums";

@Entity("accounting_rule")
export class AccountingRuleEntity {
  @PrimaryGeneratedColumn("increment", {
    name: "id",
    unsigned: true,
    comment: "규칙 고유아이디",
  })
  id: number;

  @Column("varchar", {
    name: "category",
    length: 100,
    nullable: false,
    comment: "카테고리",
  })
  category: string;

  @Column("enum", {
    name: "type",
    enum: AccountingTransactionType,
    nullable: false,
    comment: "거래 유형",
  })
  type: AccountingTransactionType;

  @Column("varchar", {
    name: "debitAccount",
    length: 120,
    nullable: false,
    comment: "차변 계정",
  })
  debitAccount: string;

  @Column("varchar", {
    name: "creditAccount",
    length: 120,
    nullable: false,
    comment: "대변 계정",
  })
  creditAccount: string;

  @Column("enum", {
    name: "vatMode",
    enum: AccountingVatMode,
    nullable: false,
    default: AccountingVatMode.Split,
    comment: "부가세 분리 방식",
  })
  vatMode: AccountingVatMode;

  @CreateDateColumn({
    type: "datetime",
    precision: 0,
    name: "createdDt",
    nullable: false,
    default: () => "CURRENT_TIMESTAMP(0)",
    comment: "규칙 데이터 생성일",
  })
  createdDt: Date;

  @UpdateDateColumn({
    type: "datetime",
    precision: 0,
    name: "updatedDt",
    nullable: true,
    default: () => "CURRENT_TIMESTAMP(0)",
    onUpdate: "CURRENT_TIMESTAMP(0)",
    comment: "규칙 데이터 수정일",
  })
  updatedDt: Date;
}
