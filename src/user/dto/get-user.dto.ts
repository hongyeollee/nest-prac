import { ApiProperty } from "@nestjs/swagger";
import { IsEmail, IsOptional, IsString, IsUUID } from "class-validator";
export class GetUserDTO {
  @IsOptional()
  @IsEmail()
  @ApiProperty({
    name: "email",
    required: false,
    nullable: true,
    example: "test@test.com",
    description: "이메일로 검색할 때 사용",
  })
  email?: string;

  @IsOptional()
  @IsUUID()
  @ApiProperty({
    name: "userUuid",
    required: false,
    nullable: true,
    example: "57581e1b-ea7d-5abh-98cb-5a32dd525193",
    description: "userUuid로 검색할 때 사용",
  })
  userUuid?: string;

  @IsOptional()
  @IsString()
  @ApiProperty({
    name: "name",
    required: false,
    nullable: true,
    example: "홍길동",
    description: "이름으로 검색할 때 사용",
  })
  name?: string;
}
