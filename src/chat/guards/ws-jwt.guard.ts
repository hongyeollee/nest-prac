import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { Observable } from "rxjs";
import { Socket } from "socket.io";
import { Payload } from "src/auth/security/user.payload.interface";

@Injectable()
export class WsJwtGuard implements CanActivate {
  constructor(private readonly jwtService: JwtService) {}

  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    const client = context.switchToWs().getClient<Socket>();

    const token = this.extractToken(client);
    if (!token) throw new UnauthorizedException("none WS token");

    try {
      const payload: Payload = this.jwtService.verify<Payload>(token);
      client.data.user = payload;
      return true;
    } catch (err) {
      throw new UnauthorizedException("invalid token");
    }
  }

  private extractToken(client: Socket): string | null {
    const authToken = client.handshake.auth?.token;
    if (typeof authToken === "string" && authToken.length > 0) return authToken;

    const header = client.handshake.headers?.authorization;
    if (typeof header === "string" && header.startsWith("Bearer ")) {
      return header.slice(7);
    }

    const queryToken = client.handshake.query?.token;
    if (typeof queryToken === "string" && queryToken.length > 0)
      return queryToken;

    return null;
  }
}
