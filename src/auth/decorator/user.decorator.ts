import { createParamDecorator, ExecutionContext } from "@nestjs/common";
import { Payload } from "../security/user.payload.interface";

export const User = createParamDecorator(
  (data: any, context: ExecutionContext) => {
    const request = context.switchToHttp().getRequest();
    return getJwtfromRequest(request);
  },
);

const getJwtfromRequest = (request) => {
  let token = null;
  if (request && request.cookies) {
    token = request.cookies["test"];
    if (!token) {
      const { authorization } = request.headers;
      if (!authorization) return token;
      token = authorization.replace("Bearer", "");
    }
  }

  const base64Payload = token.split(".")[1];
  const payloadBuffer = Buffer.from(base64Payload, "base64");
  const payload: Payload = JSON.parse(payloadBuffer.toString()) as Payload;
  return payload;
};
