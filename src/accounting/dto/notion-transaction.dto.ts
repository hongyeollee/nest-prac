import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import {
  IsBoolean,
  IsDateString,
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
} from "class-validator";
import { Type } from "class-transformer";
import {
  AccountingTransactionType,
  AccountingVatType,
} from "entities/accounting/accounting.enums";

export class NotionTransactionDto {
  @IsString()
  @IsNotEmpty()
  @ApiProperty({
    description: "노션 페이지 아이디",
    example: "c6f2b8d0-93b4-4b6f-b0b3-1d3e4f0b4b1a",
  })
  notionPageId: string;

  @IsDateString()
  @ApiProperty({
    description: "거래일",
    example: "2026-01-15",
  })
  date: string;

  @IsEnum(AccountingTransactionType)
  @ApiProperty({
    description: "거래 유형",
    enum: AccountingTransactionType,
    example: AccountingTransactionType.Sale,
  })
  type: AccountingTransactionType;

  @Type(() => Number)
  @IsNumber()
  @ApiProperty({
    description: "거래 금액",
    example: 110000,
  })
  amount: number;

  @Type(() => Boolean)
  @IsBoolean()
  @ApiProperty({
    description: "부가세 포함 여부",
    example: true,
  })
  amountIncludesVat: boolean;

  @IsEnum(AccountingVatType)
  @ApiProperty({
    description: "부가세 유형",
    enum: AccountingVatType,
    example: AccountingVatType.Taxable,
  })
  vatType: AccountingVatType;

  @IsString()
  @ApiProperty({
    description: "카테고리",
    example: "소프트웨어구독료",
  })
  category: string;

  @IsOptional()
  @IsString()
  @ApiPropertyOptional({
    description: "거래처",
    example: "노션",
  })
  counterparty?: string;

  @IsOptional()
  @IsString()
  @ApiPropertyOptional({
    description: "메모",
    example: "12월 구독료",
  })
  memo?: string;
}
