import { ApiPropertyOptional } from "@nestjs/swagger";
import { IsEnum, IsOptional, IsString } from "class-validator";
import {
  AccountingTransactionType,
  AccountingVatMode,
} from "entities/accounting/accounting.enums";

export class UpdateRuleDto {
  @IsOptional()
  @IsString()
  @ApiPropertyOptional({
    description: "카테고리",
    example: "비품비",
  })
  category?: string;

  @IsOptional()
  @IsEnum(AccountingTransactionType)
  @ApiPropertyOptional({
    description: "거래 유형",
    enum: AccountingTransactionType,
    example: AccountingTransactionType.Expense,
  })
  type?: AccountingTransactionType;

  @IsOptional()
  @IsString()
  @ApiPropertyOptional({
    description: "차변 계정",
    example: "비품비",
  })
  debitAccount?: string;

  @IsOptional()
  @IsString()
  @ApiPropertyOptional({
    description: "대변 계정",
    example: "카드미지급금",
  })
  creditAccount?: string;

  @IsOptional()
  @IsEnum(AccountingVatMode)
  @ApiPropertyOptional({
    description: "부가세 분리 방식",
    enum: AccountingVatMode,
    example: AccountingVatMode.Split,
  })
  vatMode?: AccountingVatMode;
}
