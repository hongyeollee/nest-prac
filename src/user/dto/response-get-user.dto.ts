import { ApiProperty } from "@nestjs/swagger";

export class ResponseGetUserDto {
  @ApiProperty({ example: 1 })
  id: number;

  @ApiProperty({ example: "uuid-1234" })
  userUuid: string;

  @ApiProperty({ example: "김아무개" })
  name: string;

  @ApiProperty({ example: "test@example.com" })
  email: string;

  @ApiProperty({ example: "2025-07-09T12:00:00.000Z" })
  createdDt: Date;

  @ApiProperty({ example: "2025-07-09T13:00:00.000Z" })
  updatedDt: Date;

  @ApiProperty({ example: null, nullable: true })
  deletedDt: Date | null;
}
