import {
  Controller,
  Get,
  HttpStatus,
  Param,
  Query,
  UseGuards,
} from "@nestjs/common";
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiParam,
} from "@nestjs/swagger";
import { ChatMessageService } from "../service/chat-message.service";
import { User } from "src/auth/decorator/user.decorator";
import { Payload } from "src/auth/security/user.payload.interface";
import { ChatMessageEntity } from "entities/chat/chat-message.entity";
import { GetMessagesQueryDTO } from "../dto/chat-message/get-messages.qeury.dto";
import { JwtAuthGuard } from "src/auth/security/auth.guard";

@ApiTags("채팅 메시지")
@ApiBearerAuth("accessToken")
@Controller("chat-room/:roomId/messages")
/**
 * 채팅 메시지 컨트롤러
 *
 * WebSocket을 통한 실시간 메시지 전송 테스트:
 * 1. test-websocket.html을 브라우저로 열기
 * 2. JWT 토큰으로 연결 후 roomId 입장
 * 3. 메시지 전송 시 다른 탭/브라우저에서 실시간 수신 확인 가능
 * 4. 이 API로 과거 메시지 히스토리를 페이징 조회할 수 있음
 */
export class ChatMessageController {
  constructor(private readonly chatMessageService: ChatMessageService) {}

  @Get()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({
    summary: "채팅 메시지 조회",
    description:
      "특정 채팅방의 메시지 목록을 커서 기반 페이징으로 조회합니다. 최신 메시지부터 역순으로 조회됩니다.\n\n" +
      "💡 실시간 메시지 전송은 WebSocket을 사용합니다. test-websocket.html에서 sendMessage 이벤트로 " +
      "메시지를 전송하고, 이 API로 전송된 메시지 히스토리를 확인할 수 있습니다.",
  })
  @ApiParam({
    name: "roomId",
    type: Number,
    description: "채팅방 ID",
    example: 1,
  })
  @ApiResponse({
    status: 200,
    description: "메시지 조회 성공",
    schema: {
      example: {
        statusCode: 200,
        message: "success",
        info: {
          items: [
            {
              id: 123,
              roomId: 1,
              content: "안녕하세요!",
              senderUserUuid: "550e8400-e29b-41d4-a716-446655440000",
              createdDt: "2025-12-26T10:30:00.000Z",
            },
            {
              id: 122,
              roomId: 1,
              content: "반갑습니다",
              senderUserUuid: "550e8400-e29b-41d4-a716-446655440001",
              createdDt: "2025-12-26T10:29:00.000Z",
            },
          ],
          hasNext: true,
          nextCursor: 122,
        },
      },
    },
  })
  @ApiResponse({ status: 403, description: "권한 없음 (채팅방 멤버가 아님)" })
  async getMessages(
    @Param("roomId") roomId: number,
    @User() user: Payload,
    @Query() query: GetMessagesQueryDTO,
  ): Promise<{
    statusCode: HttpStatus;
    message: string;
    info: {
      items: ChatMessageEntity[];
      hasNext: boolean;
      nextCursor: number;
    };
  }> {
    const service = await this.chatMessageService.getMessageByCursor(
      user,
      roomId,
      query.cursor,
      query.limit,
    );

    return {
      statusCode: HttpStatus.OK,
      message: "success",
      info: service,
    };
  }
}
