import { HttpStatus } from "@nestjs/common";
import { ApiProperty } from "@nestjs/swagger";

export class ResponseCommonSuccessDTO {
  @ApiProperty({
    name: "message",
    example: "success",
    description: "메시지 내용",
  })
  message: string;

  @ApiProperty({
    name: "statusCode",
    example: 200,
    description: "상태코드",
  })
  statusCode: HttpStatus;
}
