import { Module } from "@nestjs/common";
import { AuthController } from "./auth.controller";
import { AuthService } from "./auth.service";
import { UserModule } from "src/user/user.module";
import { JwtModule } from "@nestjs/jwt";
import { PassportModule } from "@nestjs/passport";
import { JwtStrategy } from "./security/passport.jwt.strategy";
import { AuthUtil } from "./auth.util";
import { EmailModule } from "src/mail/mail.module";

@Module({
  imports: [
    UserModule,
    JwtModule.register({
      secret: `${process.env.JWT_SECRET_KEY}` || "jwtSecretKey",
      signOptions: { expiresIn: "1d" }, //default값이지만 사용되는 jwt sign에서 expiresIn사용시 사용되는 메소드에서 override됨.
    }),
    PassportModule,
    EmailModule,
  ],
  controllers: [AuthController],
  providers: [AuthService, JwtStrategy, AuthUtil],
  exports: [],
})
export class AuthMoudule {}
