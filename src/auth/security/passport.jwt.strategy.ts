import { Injectable, UnauthorizedException } from "@nestjs/common";
import { PassportStrategy } from "@nestjs/passport";
import { ExtractJwt, Strategy, VerifiedCallback } from "passport-jwt";
import { Payload } from "./user.payload.interface";
import { AuthService } from "../auth.service";

const fromAuthCookie = function () {
  return function (request) {
    let token = null;
    if (request && request.cookies) {
      token = request.cookies["accessToken"];
      if (!token) {
        const { authorizaion } = request.headers;
        if (!authorizaion) return token;
        token = authorizaion.replace("Bearer ", "");
      }
    }
    return token;
  };
};
@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private authService: AuthService) {
    super({
      /**
       * headers.authorization으로 받도록 설정
       */
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      // // cookie로 jwt 토큰 받도록 설정
      // jwtFromRequest: ExtractJwt.fromExtractors([
      //   (request) => {
      //     return request?.cookies?.Authorization
      //   },
      // ]),
      // bearer cookie로
      // jwtFromRequest: fromAuthCookie(),
      //ignoreExpiration => 특정 상황에서 만료 시간을 무시하고 토큰을 계속해서 검증하고 싶다면 ignoreExpiration을 true로 설정. 개발 환경에서 토큰 만료 시간을 무시하고 접근이 가능.
      //false이면, 만료된 토큰의 경우 인증이 실패됨.
      ignoreExpiration: false,
      algorithms: ["HS256"], //옵션에 명시하지 않아도 기본값으로 사용됨.
      type: "jwt", //타입을 명시적으로 작성(이외의 타입 : 'local', 'jwt', 'bearer', 'basic' 등)
      secretOrKey: `${process.env.JWT_SECRET_KEY}` || "jwtSecretKey", //, => auth.Module에서 register()에 secret의 value값과 일치해야함.
    });
  }

  async validate(payload: Payload) {
    return {
      id: payload.id,
      userUuid: payload.userUuid,
      name: payload.name,
      email: payload.email,
    };
  }

  /**
   * 레거시 validate
   * 레거시가 된 이유: 목적자체는 DB를 사용하지 않는것인데 tokenValidateUser에서 DB를 조회하기때문에
   * 해당 부분을 효율적으로 사용하고자 하기 위하여 레거시가 되었고 위의 validate를 사용함.
   */
  // async validate(payload: Payload, done: VerifiedCallback): Promise<any> {
  //   const user = await this.authService.tokenValidateUser(payload);

  //   if (!user.payload) {
  //     return done(
  //       new UnauthorizedException({
  //         message: "user does not exist or undefined user Info",
  //       }),
  //       false,
  //     );
  //   }

  //   return done(null, user.payload);
  // }
}
