import {
  Body,
  Controller,
  Delete,
  Get,
  HttpStatus,
  Param,
  Post,
  UseGuards,
} from "@nestjs/common";
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiParam,
  ApiBody,
} from "@nestjs/swagger";
import { ChatRoomService } from "../service/chat-room.service";
import { User } from "src/auth/decorator/user.decorator";
import { Payload } from "src/auth/security/user.payload.interface";
import { CreateRoomDTO } from "../dto/chat-room/create-room.dto";
import { ChatTypeEnum } from "../enum/chat-type.enum";
import { InviteRoomDTO } from "../dto/chat-room/invite-room.dto";
import { MyRoomDTO } from "../dto/chat-room/my-room.dto";
import { JwtAuthGuard } from "src/auth/security/auth.guard";

@ApiTags("채팅방 관리")
@ApiBearerAuth("accessToken")
@Controller("chat-room")
export class ChatRoomController {
  constructor(private readonly chatRoomService: ChatRoomService) {}

  //내 채팅방 목록 조회
  @Get()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({
    summary: "내 채팅방 목록 조회",
    description:
      "현재 사용자가 속한 모든 채팅방 목록을 조회합니다. 마지막 메시지와 읽지 않은 메시지 수를 포함합니다.",
  })
  @ApiResponse({
    status: 200,
    description: "채팅방 목록 조회 성공",
    schema: {
      example: {
        statusCode: 200,
        message: "success",
        info: [
          {
            roomId: 1,
            roomType: "GROUP",
            name: "프로젝트 팀",
            memberCount: 5,
            lastMessageId: 150,
            lastMessageContent: "내일 회의 10시에 할까요?",
            lastMessageCreatedDt: "2025-12-26T10:30:00.000Z",
            unreadCount: 3,
          },
          {
            roomId: 2,
            roomType: "DM",
            name: null,
            memberCount: 2,
            lastMessageId: 89,
            lastMessageContent: "확인했습니다!",
            lastMessageCreatedDt: "2025-12-25T15:20:00.000Z",
            unreadCount: 0,
          },
        ],
      },
    },
  })
  async myrooms(@User() user: Payload): Promise<{
    statusCode: number;
    message: string;
    info: MyRoomDTO[];
  }> {
    const service = await this.chatRoomService.getMyRooms(user.userUuid);

    return {
      statusCode: HttpStatus.OK,
      message: "success",
      info: service,
    };
  }

  //채팅방 생성(1:1, 그룹)
  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({
    summary: "채팅방 생성",
    description: "1:1 또는 그룹 채팅방을 생성합니다.",
  })
  @ApiResponse({
    status: 201,
    description: "채팅방 생성 성공",
    schema: {
      example: {
        statusCode: 201,
        message: "success",
        info: {
          id: 1,
          roomType: "DM",
          name: null,
        },
      },
    },
  })
  @ApiResponse({ status: 400, description: "잘못된 요청" })
  @ApiResponse({ status: 401, description: "인증 실패" })
  async create(
    @User() user: Payload,
    @Body() createRoomDto: CreateRoomDTO,
  ): Promise<{
    statusCode: number;
    message: string;
    info: {
      id: number;
      roomType: ChatTypeEnum;
      name: string | null;
    };
  }> {
    const service = await this.chatRoomService.createRoom(user, createRoomDto);

    return {
      statusCode: HttpStatus.CREATED,
      message: "success",
      info: {
        id: service.id,
        roomType: service.roomType,
        name: service.name,
      },
    };
  }

  //채팅방 상세 조회
  @Get(":roomId")
  @UseGuards(JwtAuthGuard)
  @ApiOperation({
    summary: "채팅방 상세 조회",
    description: "특정 채팅방의 상세 정보를 조회합니다.",
  })
  @ApiParam({
    name: "roomId",
    type: Number,
    description: "채팅방 ID",
    example: 1,
  })
  @ApiResponse({
    status: 200,
    description: "채팅방 조회 성공",
    schema: {
      example: {
        statusCode: 200,
        message: "success",
        info: {
          id: 1,
          roomType: "GROUP",
          name: "프로젝트 채팅방",
          memberCount: 5,
        },
      },
    },
  })
  @ApiResponse({ status: 404, description: "채팅방을 찾을 수 없음" })
  async getRoom(
    @Param("roomId") roomId: number,
    @User() user: Payload,
  ): Promise<{
    statusCode: HttpStatus;
    message: string;
    info: {
      id: number;
      roomType: ChatTypeEnum;
      name: string;
      memberCount: number;
    };
  }> {
    const service = await this.chatRoomService.getRoom(roomId, user);

    return {
      statusCode: HttpStatus.OK,
      message: "success",
      info: {
        id: service.id,
        roomType: service.roomType,
        name: service.name,
        memberCount: service.memberCount,
      },
    };
  }

  //채팅 초대
  @Post(":roomId/members")
  @UseGuards(JwtAuthGuard)
  @ApiOperation({
    summary: "채팅방 멤버 초대",
    description: "기존 채팅방에 새로운 멤버를 초대합니다.",
  })
  @ApiParam({
    name: "roomId",
    type: Number,
    description: "채팅방 ID",
    example: 1,
  })
  @ApiBody({
    schema: {
      type: "object",
      properties: {
        inviteUserUuid: {
          type: "string",
          description: "초대를 실행하는 사용자의 UUID",
          example: "550e8400-e29b-41d4-a716-446655440000",
        },
        membersUuid: {
          type: "array",
          items: { type: "string" },
          description: "초대할 멤버들의 UUID 목록",
          example: ["550e8400-e29b-41d4-a716-446655440001"],
        },
        giveReadHistory: {
          type: "boolean",
          description: "과거 채팅 이력 열람 권한 부여 여부",
          example: false,
        },
      },
    },
  })
  @ApiResponse({
    status: 200,
    description: "멤버 초대 성공",
    schema: {
      example: {
        statusCode: 200,
        message: "success",
        added: 2,
      },
    },
  })
  @ApiResponse({ status: 403, description: "권한 없음" })
  @ApiResponse({
    status: 404,
    description: "초대할 수 없음(1:1 대화에서 추가 인원 초대)",
  })
  async invite(
    @Param("roomId") roomId: number,
    @Body() inviteRoomDto: InviteRoomDTO,
    @User() user: Payload,
  ): Promise<{
    statusCode: HttpStatus;
    message: string;
    added: number;
  }> {
    const service = await this.chatRoomService.inviteMember(
      roomId,
      inviteRoomDto,
      user,
    );

    return {
      statusCode: HttpStatus.OK,
      message: "success",
      added: service.added,
    };
  }

  //채팅방 나가기(채팅 종료)
  @Delete(":roomId/members/me")
  @UseGuards(JwtAuthGuard)
  @ApiOperation({
    summary: "채팅방 나가기",
    description: "현재 사용자가 채팅방에서 나갑니다.",
  })
  @ApiParam({
    name: "roomId",
    type: Number,
    description: "채팅방 ID",
    example: 1,
  })
  @ApiResponse({
    status: 200,
    description: "채팅방 나가기 성공",
    schema: {
      example: {
        statusCode: 200,
        message: "success",
      },
    },
  })
  @ApiResponse({
    status: 404,
    description: "채팅방을 찾을 수 없음",
    schema: {
      example: {
        statusCode: 404,
        message: "none chat",
      },
    },
  })
  @ApiResponse({
    status: 406,
    description: "이미 나간 채팅방",
    schema: {
      example: {
        statusCode: 406,
        message: "already leave",
      },
    },
  })
  async leave(
    @Param("roomId") roomId: number,
    @User() user: Payload,
  ): Promise<{
    statusCode: HttpStatus;
    message: string;
  }> {
    const service = await this.chatRoomService.leaveRoom(roomId, user);

    const result = service?.message;
    const noneChatResult = result === "none chat";
    const successResult = result === "success";

    if (successResult) {
      return {
        statusCode: HttpStatus.OK,
        message: result,
      };
    } else if (noneChatResult) {
      return {
        statusCode: HttpStatus.NOT_FOUND,
        message: result,
      };
    } else {
      //이미 퇴장한 채팅방일때
      return {
        statusCode: HttpStatus.NOT_ACCEPTABLE,
        message: result,
      };
    }
  }
}
