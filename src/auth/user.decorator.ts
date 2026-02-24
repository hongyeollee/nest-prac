/**
 * 
  차이점
  - src/auth/decorator/user.decorator.ts:4
    - request.user를 반환
    - 전제: JwtAuthGuard + JwtStrategy.validate()가 이미 토큰 검증/payload 구성 완료
    - Nest/Passport 정석 패턴
  - src/auth/user.decorator.ts:4
    - 쿠키/헤더에서 토큰 문자열을 직접 꺼내서 payload를 수동 decode
    - 서명 검증/만료검증을 데코레이터에서 하지 않음(가드에 의존하지 않으면 취약해질 여지)
    - 인증 로직이 데코레이터로 분산됨
  왜 두 번째가 비효율적/위험해질 수 있나
  - 인증 책임이 분리되지 않음: 원래 인증은 Guard/Strategy, 데코레이터는 추출만 하는 게 역할 분리에 맞음
  - 중복 로직: 토큰 추출/파싱 로직이 전략(src/auth/security/passport.jwt.strategy.ts:22)과 별도 경로로 존재
  - 실수 유발: 어떤 컨트롤러는 가드 + request.user, 어떤 곳은 직접 파싱이라 유지보수 시 혼란
  현재 프로젝트 기준 추천
  - request.user 방식으로 통일 권장
    - 이미 JwtAuthGuard(src/auth/security/auth.guard.ts:6)와 JwtStrategy.validate()가 존재
 */

/*
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
*/
