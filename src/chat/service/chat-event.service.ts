import { Injectable } from "@nestjs/common";
import { Server } from "socket.io";

@Injectable()
export class ChatEventService {
  private server: Server | null = null;

  bindServer(server: Server) {
    this.server = server;
  }

  emitToRoom(roomId: number, event: string, payload: any) {
    if (!this.server) return;
    this.server.to(roomId.toString()).emit(event, payload);
  }
}
