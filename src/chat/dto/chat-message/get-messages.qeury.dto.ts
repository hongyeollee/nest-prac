import { ApiProperty } from "@nestjs/swagger";
import { IsInt, IsOptional, Max, Min } from "class-validator";
import { Type } from "class-transformer";

export class GetMessagesQueryDTO {
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @ApiProperty({
    title: "커서 (페이징)",
    type: Number,
    name: "cursor",
    required: false,
    nullable: true,
    example: 100,
    description: "이전 페이지의 마지막 메시지 ID. 해당 ID보다 작은 메시지를 조회합니다.",
  })
  cursor?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  @ApiProperty({
    title: "조회할 메시지 개수",
    type: Number,
    name: "limit",
    required: false,
    nullable: true,
    example: 20,
    description: "한 번에 조회할 메시지 개수 (최소 1, 최대 100, 기본값 20)",
  })
  limit?: number;
}
