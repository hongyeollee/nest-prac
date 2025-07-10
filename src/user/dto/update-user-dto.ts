import { ApiProperty, OmitType } from "@nestjs/swagger";
import { CreateUserDTO } from "./create-user.dto";
import { IsNotEmpty, IsString, IsUUID } from "class-validator";

export class UpdateUserDTO extends OmitType(CreateUserDTO, ["password"]) {
  @IsString()
  @IsUUID()
  @IsNotEmpty()
  @ApiProperty({
    name: "userUuid",
    required: true,
    example: "sadf-sadf-sadf-asdf",
    nullable: false,
    description: "회원 uuid",
  })
  userUuid: string;
}
