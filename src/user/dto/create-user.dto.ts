import { ApiProperty } from "@nestjs/swagger";
import { IsEmail, IsNotEmpty, IsString, MinLength } from "class-validator";

export class CreateUserDTO {
  @IsString()
  @IsNotEmpty()
  @ApiProperty({
    name: "userType",
    example: "ADMIN",
    required: true,
    nullable: false,
    default: "GENERAL",
    description: "유저의 타입",
  })
  userType: string = "GENERAL";

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
