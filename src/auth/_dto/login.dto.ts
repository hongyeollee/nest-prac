import { ApiProperty } from "@nestjs/swagger";
import { IsEmail, IsNotEmpty, IsString } from "class-validator";

export class LoginDTO {
  @IsString()
  @IsNotEmpty()
  @IsEmail()
  @ApiProperty({
    name: "email",
    type: String,
    required: true,
    nullable: false,
    description: "이메일을 입력합니다.",
    example: "abc@def.com",
  })
  email: string;

  @IsString()
  @IsNotEmpty()
  @ApiProperty({
    name: "password",
    type: String,
    required: true,
    nullable: false,
    description: "비밀번호를 입력합니다.",
    example: "비밀번호486",
  })
  password: string;
}
