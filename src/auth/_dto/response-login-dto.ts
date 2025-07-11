import { ApiProperty } from "@nestjs/swagger";

export class ResponseInfoItemDTO {
  @ApiProperty({ description: "유저 고유 값", example: 1 })
  id: number;

  @ApiProperty({
    description: "유저 uuid",
    example: "andafs-asdfdsf-asdfsdf-asdfsadf",
  })
  userUuid: string;

  @ApiProperty({ description: "유저 이름", example: "홍길동" })
  name: string;

  @ApiProperty({ description: "유저 이메일", example: "andg@sadf.com" })
  email: string;
}

export class ResponseLoginDTO {
  @ApiProperty({ description: "리턴 메시지", example: "success" })
  message: string;

  @ApiProperty({ description: "유저정보", type: ResponseInfoItemDTO })
  user: ResponseInfoItemDTO;
}
