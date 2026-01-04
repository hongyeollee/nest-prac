import { createParamDecorator, ExecutionContext } from "@nestjs/common";
import { Payload } from "src/auth/security/user.payload.interface";
import { Socket } from "socket.io";

export const WsUser = createParamDecorator(
  (_: unknown, ctx: ExecutionContext): Payload => {
    const client = ctx.switchToWs().getClient<Socket>();
    return client.data.user as Payload;
  },
);
