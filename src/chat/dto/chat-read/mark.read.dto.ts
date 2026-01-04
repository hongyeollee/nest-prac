import { ApiProperty } from "@nestjs/swagger";
import { IsInt, Min } from "class-validator";
import { Type } from "class-transformer";

export class MarkReadDto {
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @ApiProperty({
    title: "메시지 ID",
    type: Number,
    name: "messageId",
    required: true,
    nullable: false,
    example: 123,
    description: "읽음 처리할 메시지의 고유 ID",
  })
  messageId: number;
}
