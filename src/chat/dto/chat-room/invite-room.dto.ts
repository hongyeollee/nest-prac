import { ApiProperty, PickType } from "@nestjs/swagger";
import { CreateRoomDTO } from "./create-room.dto";
import { IsBoolean, IsString } from "class-validator";

export class InviteRoomDTO extends PickType(CreateRoomDTO, ["membersUuid"]) {
  @IsBoolean()
  @ApiProperty({
    title: "과거 채팅 이력 열람 권한",
    type: Boolean,
    name: "giveReadHistory",
    required: true,
    nullable: false,
    example: false,
    description: "초대된 사용자가 초대 이전의 채팅 내용을 볼 수 있는지 여부",
  })
  giveReadHistory: boolean;

  @IsString()
  @ApiProperty({
    title: "초대하려는 유저 uuid",
    type: String,
    name: "inviteUserUuid",
    nullable: false,
    required: true,
    example: "",
    description: "초대하고자 하는 유저의 uuid값",
  })
  inviteUserUuid: string;
}
