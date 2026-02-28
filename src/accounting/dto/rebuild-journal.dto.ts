import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { IsDateString, IsEnum, IsNumber, IsOptional } from "class-validator";
import { Type } from "class-transformer";

export enum JournalRebuildMode {
  NonRetroactive = "NON_RETROACTIVE",
  Retroactive = "RETROACTIVE",
}

export class RebuildJournalDto {
  @Type(() => Number)
  @IsNumber()
  @ApiProperty({
    description: "규칙 아이디",
    example: 1,
  })
  ruleId: number;

  @IsEnum(JournalRebuildMode)
  @ApiProperty({
    description: "재분개 방식",
    enum: JournalRebuildMode,
    example: JournalRebuildMode.NonRetroactive,
  })
  mode: JournalRebuildMode;

  @IsOptional()
  @IsDateString()
  @ApiPropertyOptional({
    description: "재분개 시작일",
    example: "2026-01-01",
  })
  startDate?: string;

  @IsOptional()
  @IsDateString()
  @ApiPropertyOptional({
    description: "재분개 종료일",
    example: "2026-01-31",
  })
  endDate?: string;
}
