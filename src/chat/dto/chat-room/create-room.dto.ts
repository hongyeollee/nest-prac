import { ApiProperty } from "@nestjs/swagger";
import {
  ArrayMinSize,
  IsArray,
  IsEnum,
  IsOptional,
  IsString,
  IsUUID,
} from "class-validator";
import { ChatTypeEnum } from "src/chat/enum/chat-type.enum";

export class CreateRoomDTO {
  @IsEnum(ChatTypeEnum)
  @ApiProperty({
    title: "채팅 타입 구분",
    enum: ChatTypeEnum,
    name: "roomType",
    required: true,
    nullable: false,
    example: ChatTypeEnum.DM,
    description: "채팅의 타입(DM: 개인채팅, GROUP: 그룹채팅) 구분",
  })
  roomType: ChatTypeEnum;

  @IsOptional()
  @IsString()
  @ApiProperty({
    title: "채팅방 제목",
    type: String,
    name: "name",
    required: false,
    nullable: true,
    example: null,
    description: `
      채팅방 이름
      - 개인 채팅 및 그룹 채팅에서는 채팅방 이름없이 채팅방 개설이 가능합니다.
    `,
  })
  name?: string | null;

  @IsArray()
  @ArrayMinSize(1)
  @IsUUID("all", { each: true })
  @ApiProperty({
    title: "초대할 멤버 UUID 목록",
    type: [String],
    name: "membersUuid",
    required: true,
    nullable: false,
    example: ["550e8400-e29b-41d4-a716-446655440000"],
    description: "채팅방에 초대할 사용자 UUID 배열 (최소 1명 이상)",
  })
  membersUuid: string[];
}
