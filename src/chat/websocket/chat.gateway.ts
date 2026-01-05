import {
  ConnectedSocket,
  MessageBody,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from "@nestjs/websockets";
import { Server, Socket } from "socket.io";
import { ChatRoomService } from "../service/chat-room.service";
import { ChatMessageService } from "../service/chat-message.service";
import { Payload } from "src/auth/security/user.payload.interface";
import { UseGuards } from "@nestjs/common";
import { WsJwtGuard } from "../guards/ws-jwt.guard";
import { ChatEventService } from "../service/chat-event.service";

type RoomAction = "join" | "leave";

/**
 * 채팅 WebSocket Gateway
 *
 * @description
 * 실시간 채팅 기능을 제공하는 WebSocket 게이트웨이입니다.
 *
 * **🧪 WebSocket 테스트 페이지**: `/test-websocket.html`
 * - 브라우저에서 접속하여 실시간 채팅 기능을 바로 테스트할 수 있습니다
 * - JWT 토큰으로 인증 후 방 입장, 메시지 송수신, 타이핑 상태 등 모든 기능 테스트 가능
 *
 * @namespace /chat
 * @connection wss://your-domain/chat (production) | ws://localhost:3000/chat (development)
 *
 * @authentication
 * JWT 토큰 인증이 필요합니다. 다음 방법 중 하나로 토큰을 전달할 수 있습니다:
 * 1. handshake.auth.token (권장)
 * 2. handshake.headers.authorization (Bearer 형식)
 * 3. handshake.query.token
 *
 * @events
 *
 * **클라이언트 → 서버 이벤트**
 *
 * 1. `joinOrLeftRoom` - 채팅방 입장/퇴장
 *    - Payload: { roomId: number, action: "join" | "leave" }
 *    - Response: "join" | "leave" | "none"
 *    - 서버 emit: "joinedRoom" 또는 "leftRoom" { roomId: number }
 *
 * 2. `sendMessage` - 메시지 전송
 *    - Payload: { roomId: number, content: string }
 *    - Response: { message: "success", info: MessageInfo }
 *    - 방 전체 emit: "messageCreated" { id, roomId, content, senderUserUuid, createdDt }
 *
 * 3. `typing` - 타이핑 상태 전송
 *    - Payload: { roomId: number, isTyping: boolean }
 *    - 다른 멤버들에게 emit: "typing" { roomId, userUuid, isTyping }
 *
 * **서버 → 클라이언트 이벤트**
 *
 * 1. `joinedRoom` - 방 입장 완료
 *    - Payload: { roomId: number }
 *
 * 2. `leftRoom` - 방 퇴장 완료
 *    - Payload: { roomId: number }
 *
 * 3. `messageCreated` - 새 메시지 생성
 *    - Payload: { id, roomId, content, senderUserUuid, createdDt }
 *
 * 4. `typing` - 타이핑 상태 변경
 *    - Payload: { roomId, userUuid, isTyping }
 *
 * 5. `readUpdated` - 읽음 상태 업데이트
 *    - Payload: { userUuid, messageId }
 *
 * @example
 * ```javascript
 * // 연결
 * const socket = io('http://localhost:3000/chat', {
 *   auth: {
 *     token: 'your-jwt-token'
 *   }
 * });
 *
 * // 방 입장
 * socket.emit('joinOrLeftRoom', { roomId: 1, action: 'join' });
 *
 * // 메시지 전송
 * socket.emit('sendMessage', { roomId: 1, content: '안녕하세요!' });
 *
 * // 새 메시지 수신
 * socket.on('messageCreated', (data) => {
 *   console.log('새 메시지:', data);
 * });
 *
 * // 타이핑 상태 전송
 * socket.emit('typing', { roomId: 1, isTyping: true });
 *
 * // 타이핑 상태 수신
 * socket.on('typing', (data) => {
 *   console.log('타이핑 중:', data.userUuid);
 * });
 * ```
 */
@WebSocketGateway({
  namespace: "/chat",
  cors: { origin: "*" },
})
@UseGuards(WsJwtGuard)
export class ChatGateway {
  @WebSocketServer()
  server: Server;

  constructor(
    private readonly chatRoomService: ChatRoomService,
    private readonly chatMessageService: ChatMessageService,
    private readonly chatEventService: ChatEventService,
  ) {}

  afterInit(server: Server) {
    this.chatEventService.bindServer(server);
  }

  // private async asyncgetUserUuid(user: Payload): Promise<string> {
  //   const userInfo = await this.userService.getUser({
  //     userUuid: user.userUuid,
  //   });
  //   return user.userUuid;
  // }

  //해당 방법이 맞는지 검증 확인 필요
  private getUserUuid(client: Socket): string {
    return client.data.user.userUuid;
  }

  @SubscribeMessage("joinOrLeftRoom")
  async joinRoom(
    @ConnectedSocket() client: Socket,
    @MessageBody("roomId") roomId: number,
    @MessageBody("action") action: RoomAction,
  ) {
    const roomIdToString = roomId.toString();
    const userUuid = this.getUserUuid(client);

    await this.chatRoomService.getActiveMemberOrThrow(roomId, userUuid);

    if (action === "join") {
      client.join(roomIdToString);
      client.emit("joinedRoom", { roomId });
      console.log(
        `[DEBUG] User ${userUuid} joined room ${roomId}. Socket ID: ${client.id}`,
      );
      return "join";
    } else if (action === "leave") {
      client.leave(roomIdToString);
      client.emit("leftRoom", { roomId });
      console.log(
        `[DEBUG] User ${userUuid} left room ${roomId}. Socket ID: ${client.id}`,
      );
      return "leave";
    } else {
      return "none";
    }
  }

  @SubscribeMessage("sendMessage")
  async sendMessage(
    @ConnectedSocket() client: Socket,
    @MessageBody("roomId") roomId: number,
    @MessageBody("content") content: string,
  ) {
    const saved = await this.chatMessageService.createMessage(
      roomId,
      this.getUserUuid(client),
      content,
    );

    this.server.to(roomId.toString()).emit("messageCreated", {
      id: saved.id,
      roomId: saved.roomId,
      content: saved.content,
      senderUserUuid: saved.senderUserUuid,
      createdDt: saved.createdDt,
    });

    return {
      message: "success",
      info: saved,
    };
  }

  @SubscribeMessage("typing")
  async typing(
    @ConnectedSocket() client: Socket,
    @MessageBody("roomId") roomId: number,
    @MessageBody("isTyping") isTyping: boolean,
  ) {
    const userUuid = this.getUserUuid(client);
    await this.chatRoomService.getActiveMemberOrThrow(roomId, userUuid);

    /**
     * 타이핑 디버깅 콘솔
     */
    // console.log(
    //   `[DEBUG] User ${userUuid} typing status: ${isTyping} in room ${roomId}. Socket ID: ${client.id}`,
    // );
    // console.log(`[DEBUG] Emitting typing event to room ${roomId.toString()}`);

    client.to(roomId.toString()).emit("typing", {
      roomId,
      userUuid,
      isTyping,
    });
  }
}
