import { Body, Controller, Get, NotFoundException, Post, Req, UseGuards } from "@nestjs/common";
import { AuthService } from "./auth.service";
import { Request } from "express";
import { JwtAuthGuard } from "./security/auth.guard";

@Controller('auth')
export class AuthController {
  constructor(
    private authService: AuthService,
  ) {}

  @Post('login')
  async login(
    @Body('email') email: string,
    @Body('password') password: string,
  ) {
    return await this.authService.login(email, password)
  }

  @Get('authenticate')
  @UseGuards(JwtAuthGuard)
  async isAuthenticate(@Req() req: Request) {
    const user = req.user
    
    if(!user) {
      throw new NotFoundException(
        'not exist user info'
      )
    }

    return user
  }
}