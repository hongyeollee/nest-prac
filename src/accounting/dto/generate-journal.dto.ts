import { ApiPropertyOptional } from "@nestjs/swagger";
import { IsDateString, IsOptional } from "class-validator";

export class GenerateJournalDto {
  @IsOptional()
  @IsDateString()
  @ApiPropertyOptional({
    description: "분개 생성 시작일",
    example: "2026-01-01",
  })
  startDate?: string;

  @IsOptional()
  @IsDateString()
  @ApiPropertyOptional({
    description: "분개 생성 종료일",
    example: "2026-01-31",
  })
  endDate?: string;
}
