import { ApiProperty } from "@nestjs/swagger";
import { IsEnum, IsNotEmpty, IsString } from "class-validator";
import {
  AccountingTransactionType,
  AccountingVatMode,
} from "entities/accounting/accounting.enums";

export class CreateRuleDto {
  @IsString()
  @IsNotEmpty()
  @ApiProperty({
    description: "카테고리",
    example: "비품비",
  })
  category: string;

  @IsEnum(AccountingTransactionType)
  @ApiProperty({
    description: "거래 유형",
    enum: AccountingTransactionType,
    example: AccountingTransactionType.Expense,
  })
  type: AccountingTransactionType;

  @IsString()
  @IsNotEmpty()
  @ApiProperty({
    description: "차변 계정",
    example: "비품비",
  })
  debitAccount: string;

  @IsString()
  @IsNotEmpty()
  @ApiProperty({
    description: "대변 계정",
    example: "카드미지급금",
  })
  creditAccount: string;

  @IsEnum(AccountingVatMode)
  @ApiProperty({
    description: "부가세 분리 방식",
    enum: AccountingVatMode,
    example: AccountingVatMode.Split,
  })
  vatMode: AccountingVatMode;
}
