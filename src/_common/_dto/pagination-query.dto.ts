import { ApiPropertyOptional } from "@nestjs/swagger";
import { Type } from "class-transformer";
import { IsInt, IsOptional, Min } from "class-validator";

export class PaginationQueryDTO {
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @IsOptional()
  @ApiPropertyOptional({
    name: "page",
    example: 1,
    default: 1,
    description: "페이지 번호(기본값 1)",
  })
  page: number = 1;

  @Type(() => Number)
  @IsInt()
  @Min(1)
  @IsOptional()
  @ApiPropertyOptional({
    name: "limit",
    example: 10,
    default: 10,
    description: "페이지 크기(기본 10)",
  })
  limit: number = 10;
}
