import { ApiProperty } from "@nestjs/swagger";
import { IsEmail, IsNotEmpty, IsString, Min, MinLength } from "class-validator";
import { ResponseCommonSuccessDTO } from "src/_common/_dto/common-success-response.dto";

export class CreateUserDTO {
  @IsString()
  @IsNotEmpty()
  @MinLength(2)
  @ApiProperty({
    name: "name",
    example: "김아무개",
    required: true,
    nullable: false,
    description: "사용자 이름",
    minLength: 2,
  })
  name: string;

  @IsString()
  @IsEmail()
  @IsNotEmpty()
  @ApiProperty({
    name: "email",
    example: "abcd@efgh.com",
    required: true,
    nullable: false,
    description: "사용자 이메일 주소",
  })
  email: string;

  @IsString()
  @IsNotEmpty()
  @ApiProperty({
    name: "password",
    example: "Avnf1@8ng",
    required: true,
    nullable: false,
    description: "사용자 비밀번호",
  })
  password: string;
}
