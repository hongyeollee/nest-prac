import { Module } from "@nestjs/common";
import { AuthController } from "./auth.controller";
import { AuthService } from "./auth.service";
import { UserModule } from "src/user/user.module";
import { JwtModule } from "@nestjs/jwt";
import { PassportModule } from "@nestjs/passport";
import { JwtStrategy } from "./security/passport.jwt.strategy";

@Module({
  imports: [
    UserModule,
    JwtModule.register({
      secret: `${process.env.JWT_SECRET_KEY}` || "jwtSecretKey",
      signOptions: { expiresIn: "1d" },
    }),
    PassportModule,
  ],
  controllers: [AuthController],
  providers: [AuthService, JwtStrategy],
  exports: [],
})
export class AuthMoudule {}
