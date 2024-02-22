import { Body, Controller, Get, NotFoundException, Post, Req, Res, UseGuards } from "@nestjs/common";
import { AuthService } from "./auth.service";
import { Request, Response } from "express";
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
    @Res({ passthrough: true }) res: Response,
    /**
     * passthrogh 사용하는 이유 
     * passthrough 옵션은 NestJS에서 @Res() 데코레이터로 주입되는 응답 객체(Response 객체)에 대한 동작을 설정하는 옵션입니다.
     * passthrough를 true로 설정하면, 해당 응답 객체가 라우터 핸들러에서 직접 수정되지 않도록 허용합니다. 기본적으로는 false로 설정되어 있습니다.
     * 일반적으로 라우터 핸들러 내에서 응답 객체를 직접 조작하는 것이 흔합니다.
     * 그러나 경우에 따라서는 미들웨어에서 이미 조작된 응답 객체를 라우터 핸들러로 전달하고 싶을 때, @Res({ passthrough: true })를 사용합니다.
     * 이렇게 하면 해당 응답 객체가 라우터 핸들러로 전달되기 전에 미들웨어에서 조작된 내용이 유지됩니다.
     */    
  ) {
    const accessToken =  await this.authService.login(email, password)
    res.header('Access-Control-Expose-Headers', 'Authorization')
    res.setHeader('Authorization', 'Bearer ' + accessToken.accessToken)
    res.cookie('accessToken', accessToken.accessToken)

    return {
      message: 'success',
      token: accessToken.accessToken,
      info: accessToken.payload,
    }
  }

  @Get('authentication')
  @UseGuards(JwtAuthGuard)
  async isAuthenticate(@Req() req: Request) {
    const token = req.cookies['accessToken']
    
    if(!token) {
      throw new NotFoundException(
        'not exist user info'
      )
    }
    
    return {
      message: 'success',
      token,
    }
  }
}