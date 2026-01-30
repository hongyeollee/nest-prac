import { ApiPropertyOptional } from "@nestjs/swagger";
import { IsEnum, IsOptional } from "class-validator";
import { AccountingTransactionStatus } from "entities/accounting/accounting.enums";

export class InboxQueryDto {
  @IsOptional()
  @IsEnum(AccountingTransactionStatus)
  @ApiPropertyOptional({
    description: "조회 상태",
    enum: AccountingTransactionStatus,
    example: AccountingTransactionStatus.Review,
  })
  status?: AccountingTransactionStatus;
}
