import { ApiPropertyOptional } from "@nestjs/swagger";
import { IsEnum, IsOptional, IsString } from "class-validator";
import { AccountingTransactionType } from "entities/accounting/accounting.enums";

export class RuleQueryDto {
  @IsOptional()
  @IsEnum(AccountingTransactionType)
  @ApiPropertyOptional({
    description: "거래 유형",
    enum: AccountingTransactionType,
    example: AccountingTransactionType.Sale,
  })
  type?: AccountingTransactionType;

  @IsOptional()
  @IsString()
  @ApiPropertyOptional({
    description: "카테고리",
    example: "비품비",
  })
  category?: string;
}
