import {
  Body,
  Controller,
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
} from "@nestjs/swagger";
import { ChatReadMessageService } from "../service/chat-read-message.service";
import { User } from "src/auth/decorator/user.decorator";
import { Payload } from "src/auth/security/user.payload.interface";
import { ChatEventService } from "../service/chat-event.service";
import { MarkReadDto } from "../dto/chat-read/mark.read.dto";
import { JwtAuthGuard } from "src/auth/security/auth.guard";

@ApiTags("채팅 메시지 읽음 처리")
@ApiBearerAuth("accessToken")
@Controller("chat-rooms/:roomId/read")
/**
 * 채팅 메시지 읽음 상태 관리 컨트롤러
 *
 * WebSocket 실시간 읽음 상태 동기화:
 * - 이 API로 메시지를 읽음 처리하면 readUpdated 이벤트가 채팅방의 모든 멤버에게 전송됨
 * - test-websocket.html에서 readUpdated 이벤트를 수신하여 실시간 읽음 상태 확인 가능
 * - 읽지 않은 메시지 카운트를 실시간으로 업데이트할 수 있음
 */
export class ChatReadMessageController {
  constructor(
    private readonly chatReadMessageService: ChatReadMessageService,
    private readonly chatEventService: ChatEventService,
  ) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({
    summary: "메시지 읽음 처리",
    description:
      "특정 메시지를 읽음으로 표시합니다. 해당 메시지 ID 이하의 모든 메시지가 읽은 것으로 처리됩니다.\n\n" +
      "💡 실시간 동기화: 읽음 처리 후 readUpdated 이벤트가 WebSocket을 통해 방의 모든 멤버에게 브로드캐스트되어 " +
      "실시간으로 읽음 상태가 동기화됩니다. test-websocket.html에서 이벤트 수신을 확인할 수 있습니다.",
  })
  @ApiParam({
    name: "roomId",
    type: Number,
    description: "채팅방 ID",
    example: 1,
  })
  @ApiResponse({
    status: 200,
    description: "읽음 처리 성공",
    schema: {
      example: {
        statusCode: 200,
        message: "success",
      },
    },
  })
  @ApiResponse({ status: 403, description: "권한 없음 (채팅방 멤버가 아님)" })
  @ApiResponse({ status: 404, description: "메시지를 찾을 수 없음" })
  async markRead(
    @User() user: Payload,
    @Param("roomId") roomId: number,
    @Body() body: MarkReadDto,
  ): Promise<{
    statusCode: HttpStatus;
    message: string;
  }> {
    const service = await this.chatReadMessageService.markRead(
      user,
      roomId,
      body.messageId,
    );

    this.chatEventService.emitToRoom(roomId, "readUpdated", {
      userUuid: user.userUuid,
      messageId: body.messageId,
    });

    return {
      statusCode: HttpStatus.OK,
      message: service.message,
    };
  }
}
