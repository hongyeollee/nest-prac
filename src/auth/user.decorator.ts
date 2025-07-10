import { ExecutionContext, createParamDecorator } from "@nestjs/common";
import { Payload } from "./security/user.payload.interface";

export const User = createParamDecorator(
  (data: any, context: ExecutionContext) => {
    const req = context.switchToHttp().getRequest();
    return getJwtFromRequest(req);
  },
);

function getJwtFromRequest(req) {
  let token = null;
  if (req && req.cookies) {
    token = req.cookies["accessToken"];
    if (!token) {
      const { authorization } = req.headers;
      //왜 authorization을 구조분해할당으로 사용했는지에 대해서 공부해야할 필요가 있습니다.
      if (!authorization) return token;
      token = authorization.replace("Bearer ", "");
    }
    const base64Payload = token.split(".")[1];
    const payloadBuffer = Buffer.from(base64Payload, "base64");

    const payload: Payload = JSON.parse(payloadBuffer.toString());

    if (payload) {
      return payload;
    }

    return null;
  }
}
