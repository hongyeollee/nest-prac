import {
  Body,
  Controller,
  Get,
  HttpStatus,
  InternalServerErrorException,
  NotFoundException,
  Patch,
  Post,
  Req,
  Res,
  UnauthorizedException,
  UseGuards,
} from "@nestjs/common";
import { AuthService } from "./auth.service";
import { Request, Response } from "express";
import { JwtAuthGuard } from "./security/auth.guard";
import {
  ApiBearerAuth,
  ApiBody,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
  ApiUnprocessableEntityResponse,
} from "@nestjs/swagger";
import { LoginDTO } from "./_dto/login.dto";
import { ResponseLoginDTO } from "./_dto/response-login-dto";
import { ResponseCommonSuccessDTO } from "src/_common/_dto/common-success-response.dto";

@Controller("auth")
@ApiTags("auth")
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post("login")
  @ApiOperation({
    summary: "회원 로그인",
    description: `
      회원이 로그인을 합니다.
      - accessToken은 request headers의 Authorization에 Bearer 형태로 값이 존재합니다.
      - refreshToken은 application의 cookies에 refreshToken으로 값이 존재합니다.
      - accessToken의 유효시간은 생성후 "15분", refreshToken은 생성후 "7일"입니다. 
    `,
  })
  @ApiBody({
    description: "로그인에 사용되는 정보 입니다.",
    required: true,
    type: LoginDTO,
  })
  @ApiUnprocessableEntityResponse({
    description: "잘못된 비밀번호 입력시",
    example: {
      message: "not matched password",
      error: "Unprocessable Entity",
      statusCode: HttpStatus.UNPROCESSABLE_ENTITY,
    },
  })
  @ApiOkResponse({
    description: "로그인 성공",
    example: {
      message: "success",
      accessToken:
        "eyJhbGiIsInR5cCI6IkpXVCJ9.eyJpZCI6NCwidXNlclV1aWQiOiJkOTE0MzNmNC0zMDdkLTRmZjUtODQ3Ni0wNzU0OTI5OTc1NzciLCJuYW1lIjoi7J207ZmN7Je0IiWxlcjEwMDRAbmF2ZXIuY29tIiwiaWF0IjoxNzUyMTU4MjQzLCJleHAiOjE3NTIyNDQ2NDN9.Fcy7QIh_Y-wK0jGeSgbon4hg8S",
      info: {
        id: 0,
        userUuid: "d91433f4-307d-4ff5-8476-23458324759834",
        name: "홍길동",
        email: "hong@bape.in",
      },
    },
  })
  async login(
    @Body() loginDto: LoginDTO,
    @Res({ passthrough: true }) res: Response,
    /**
     * passthrogh 사용하는 이유
     * passthrough 옵션은 NestJS에서 @Res() 데코레이터로 주입되는 응답 객체(Response 객체)에 대한 동작을 설정하는 옵션입니다.
     * passthrough를 true로 설정하면, 해당 응답 객체가 라우터 핸들러에서 직접 수정되지 않도록 허용합니다. 기본적으로는 false로 설정되어 있습니다.
     * 일반적으로 라우터 핸들러 내에서 응답 객체를 직접 조작하는 것이 흔합니다.
     * 그러나 경우에 따라서는 미들웨어에서 이미 조작된 응답 객체를 라우터 핸들러로 전달하고 싶을 때, @Res({ passthrough: true })를 사용합니다.
     * 이렇게 하면 해당 응답 객체가 라우터 핸들러로 전달되기 전에 미들웨어에서 조작된 내용이 유지됩니다.
     */
  ): Promise<ResponseLoginDTO> {
    const loginInfo = await this.authService.login(loginDto);
    res.header("Access-Control-Expose-Headers", "Authorization");
    res.setHeader("Authorization", "Bearer " + loginInfo.accessToken);
    // res.cookie("accessToken", loginInfo.accessToken);
    /**
     * accessToken은 setHeader에 심어서 프론트에서 꺼내서 사용할 수 있도록 하는걸 추천
     * 프론트에서 명확히 제어가능, CORS, 보안정책 대응 용이
     */
    res.cookie("refreshToken", loginInfo.refreshToken, {
      httpOnly: true,
      secure: true,
      sameSite: "strict",
      maxAge: 1000 * 60 * 60 * 24 * 7, // 7d
    });

    return {
      message: "success",
      // accessToken: loginInfo.accessToken,
      /**
       * accessToken을 response에 굳이 노출하지 않고 프론트에서 headers의 Authorization에 전달
       * 하는것으로 내용은 충분하기때문에 리턴값에 노출시키지 않는다.
       */
      // refreshToken: loginInfo.refreshToken,
      /**
       * 가능하면 refreshToken은 프론트에 직접 전달하지 않는 것이 보안상 좋습니다.
       * 이유: XSS 공격에 취약 → 공격자가 토큰 탈취 후 무한 재발급 가능.
       */
      user: loginInfo.payload,
    };
  }

  @Post("refresh")
  @ApiOperation({
    summary: "accessToken 재발급",
    description:
      "accessToken이 만료되었을때 refreshToken을 통해서 accessToken을  재발급을 합니다.",
  })
  async refresh(
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ): Promise<void> {
    const refreshToken = req.cookies.refreshToken;

    if (!refreshToken) {
      throw new UnauthorizedException("Refresh token not found");
    }

    const { accessToken, refreshToken: newRefreshToken } =
      await this.authService.refreshAccessToken(refreshToken);

    res.setHeader("Authorization", "Bearer " + accessToken);
    res.cookie("refreshToken", newRefreshToken, {
      httpOnly: true,
      secure: true,
      sameSite: "strict",
      maxAge: 1000 * 60 * 60 * 24 * 7,
    });
    return;
  }

  @Get("me")
  @ApiOperation({
    summary: "내 정보 가져오기",
    description:
      "토큰에 대한 유효기간을 확인하기 위해 사용자의 정보를 가져옵니다.",
  })
  @ApiBearerAuth("accessToken")
  @UseGuards(JwtAuthGuard)
  getMe(@Req() req: Request) {
    return req.user;
  }

  @Get("authentication")
  @ApiOperation({
    summary: "로그인후에 유저정보 체크용",
    description:
      "로그인 / refreshToken 기능추가로 인해 me api 추가 되어 해당 api는 현재 사용하지 않습니다.",
    deprecated: true,
    tags: ["미사용"],
  })
  @UseGuards(JwtAuthGuard)
  async isAuthenticate(@Req() req: Request) {
    const token = req.cookies["accessToken"];

    if (!token) {
      throw new NotFoundException("not exist user info");
    }

    return {
      message: "success",
      token,
    };
  }

  @ApiOperation({
    summary: "로그아웃",
    description: `
      회원이 로그아웃 합니다.
        - Headers의 Authorization 헤더 제거는 클라이언트가 제거해야 합니다.
        - 서버에서는 쿠키의 refreshToken만 제거합니다.
      `,
  })
  @ApiOkResponse({
    description: "로그아웃 성공",
    type: ResponseCommonSuccessDTO,
    example: {
      message: "logout",
      statusCode: HttpStatus.OK,
    },
  })
  @Post("logout")
  logout(@Res({ passthrough: true }) res: Response): ResponseCommonSuccessDTO {
    /**
     * accessToken은 headers의 Authorization에 있어 프론트에서 헤더를 제거
     *  -> req.headers.Authorization은 클라이언트가 요청할 때 넣은 값
     *  -> 서버는 그 값을 읽기만 가능하고 클라이언트 저장소(브라우저, 앱의 localStorage/cookie 등)를 직접 조작할 수 없다.
     * refreshToken은 cookie로 존재하기때문에 백엔드에서 핸들링 가능
     */

    //case1. cookie 메소드에서 유효기간 0
    // res.cookie('refreshToken', '', {
    //   maxAge: 0
    // })

    //case2. clearCookie 메소드 사용
    res.clearCookie("refreshToken");

    //case3.setCookie에 토큰값 null string으로 사전처리(그럼 유저정보가 없기때문에 접근을 못하도록 사전처리됨)
    // res.setHeader('Authorization', '') //좀 더 강화하려면 setHeader도 null string처리 해주는것도 좋을것 같음.
    // res.cookie('refreshToken', '')

    return {
      message: "logout",
      statusCode: HttpStatus.OK,
    };
  }

  @Patch("auth-password")
  @ApiOperation({
    summary: "회원 임시 비밀번호 설정 및 임시비밀번호 회원 메일로 발송",
    description:
      "회원이 비밀번호를 분실한 경우 새로운 임시 비밀번호를 생성하고 임시 비밀번호를 회원의 이메일로 발송합니다.",
  })
  @ApiNotFoundResponse({
    description: "회원 정보 없음",
    content: {
      "application/json": {
        example: {
          statusCode: HttpStatus.NOT_FOUND,
          message: "Not exist user",
          error: "Not Found",
        },
      },
    },
  })
  @ApiOkResponse({
    description: "임시비밀번호 생성 및 임시비밀번호 회원 메일 발송 성공",
    example: {
      message: "success",
      statusCode: HttpStatus.OK,
    },
  })
  async autoUpdatePassword(email: string) {
    try {
      await this.authService.autoUpdatePassword(email);

      return {
        message: "success",
        statusCode: HttpStatus.OK,
      };
    } catch (err) {
      throw new InternalServerErrorException(err);
    }
  }
}
