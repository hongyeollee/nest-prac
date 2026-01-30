import { ApiPropertyOptional } from "@nestjs/swagger";
import { IsDateString, IsOptional } from "class-validator";

export class ExportExcelQueryDto {
  @IsOptional()
  @IsDateString()
  @ApiPropertyOptional({
    description: "엑셀 추출 시작일",
    example: "2026-01-01",
  })
  startDate?: string;

  @IsOptional()
  @IsDateString()
  @ApiPropertyOptional({
    description: "엑셀 추출 종료일",
    example: "2026-01-31",
  })
  endDate?: string;
}
