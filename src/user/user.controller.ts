import {
  Body,
  Controller,
  Get,
  HttpStatus,
  Param,
  Patch,
  Post,
  Put,
  Query,
  UseGuards,
} from "@nestjs/common";
import { UserService } from "./user.service";
import { CreateUserDTO } from "./dto/create-user.dto";
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiBody,
  ApiConflictResponse,
  ApiCreatedResponse,
  ApiNotAcceptableResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiTags,
  ApiUnauthorizedResponse,
  ApiUnprocessableEntityResponse,
} from "@nestjs/swagger";
import { UserEntity } from "entities/user.entity";
import { instanceToPlain } from "class-transformer";
import { GetUserDTO } from "./dto/get-user.dto";
import { ResponseGetUserDTO } from "./dto/response-get-user.dto";
import { ResponseGetUserListDTO } from "./dto/response-get-user-list.dto";
import { UpdateUserDTO } from "./dto/update-user-dto";
import { UpperCasePipe } from "src/_common/pipes/uppercase.pipe";
import { ResponseCommonSuccessDTO } from "src/_common/_dto/common-success-response.dto";
import { ParseintPipe } from "src/_common/pipes/parseint.pipe";
import { JwtAuthGuard } from "src/auth/security/auth.guard";
import { Roles } from "src/auth/decorator/roles.decorator";
import { User } from "src/auth/decorator/user.decorator";
import { Payload } from "src/auth/security/user.payload.interface";
import { RolesGuard } from "src/auth/security/role.guard";

@Controller("user")
@ApiTags("user")
export class UserController {
  constructor(private userService: UserService) {}

  @Get("list")
  // @ApiBearerAuth() 토큰 인증 필요
  @ApiOperation({
    summary: "회원 목록 조회",
    description: "회원들의 정보 목록을 조회합니다.",
  })
  @ApiOkResponse({
    description: "조회 성공",
    isArray: true,
    type: ResponseGetUserListDTO,
  })
  async getUserList(): Promise<ResponseGetUserListDTO> {
    return await this.userService.getUserList();
  }

  @Get()
  // @ApiBearerAuth() 토zms 인증 필요
  @ApiOperation({
    summary: "회원 상세 조회",
    description: `
      email, userUuid, name 중 하나 이상을 기준으로 유저를 조회합니다.
      - 예시1: /api/user?email=test@test.com
      - 예시2: /api/user?userUuid=...
      - 예시3: /api/user?name=...
    `,
  })
  @ApiBadRequestResponse({
    description: "잘못된 이메일 형식 입력시",
    content: {
      "application/json": {
        example: {
          message: ["email must be an email"],
          error: "Bad Request",
          statusCode: HttpStatus.BAD_REQUEST,
        },
      },
    },
  })
  @ApiNotAcceptableResponse({
    description: "검색조건 파라미터가 없는경우",
    content: {
      "application/json": {
        example: {
          statusCode: 406,
          statusText: "NOTACCEPTABLE",
          message: "at least one of parameter email, userUuid, name requires",
          timestamp: "2025-12-08T05:52:00.607Z",
          path: "/api/user?email=test@test.com",
        },
      },
    },
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
    description: "회원 정보 조회 성공",
    type: ResponseGetUserDTO,
  })
  async getUser(@Query() getUserDto: GetUserDTO): Promise<ResponseGetUserDTO> {
    const user = await this.userService.getUser(getUserDto);
    return instanceToPlain(user) as ResponseGetUserDTO;
  }

  @Post()
  @ApiOperation({
    summary: "회원가입",
    description: "사용자가 회원 가입을 합니다.",
  })
  @ApiConflictResponse({
    description: "이미 존재하는 email일때",
    example: {
      message: "already exist email",
      error: "Conflict",
      statusCode: HttpStatus.CONFLICT,
    },
  })
  @ApiCreatedResponse({
    status: HttpStatus.CREATED,
    description: "회원가입 성공",
    type: UserEntity,
    example: {
      userUuid: "d3e3dcb5-b123-456f-bc66-7b6d3b456789",
      name: "김아무개",
      email: "abc@example.com",
      createdDt: "2025-07-07T05:55:00.000Z",
    },
  })
  async createUser(
    @Body() createUserDto: CreateUserDTO,
  ): Promise<Partial<UserEntity>> {
    const user = await this.userService.createUser(createUserDto);
    return instanceToPlain(user);
  }

  @Put()
  @ApiOperation({
    summary: "회원 정보 수정",
    description: "회원의 정보를 수정합니다.",
  })
  @ApiBody({
    description:
      "수정할 회원 정보. 이메일은 식별자이며 수정 대상의 기준입니다.",
    type: UpdateUserDTO,
    required: true,
    examples: {
      수정예시: {
        summary: "이름수정",
        value: {
          email: "abc@def.com",
          userUuid: "asdf-asdf-sadf-asdf",
          name: "강연수",
        },
      },
    },
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
  @ApiBadRequestResponse({
    description: "회원 uuid가 잘못된 정보일때",
    example: {
      statusCode: HttpStatus.BAD_REQUEST,
      message: "Not matched userUuid",
      error: "Bad Request",
    },
  })
  @ApiOkResponse({
    description: "회원 정보 수정 성공",
    example: {
      statusCode: HttpStatus.OK,
      message: "success",
    },
  })
  async updateUser(@Body() updateUserDto: UpdateUserDTO) {
    return await this.userService.updateUser(updateUserDto);
  }

  @Patch(":id")
  @ApiBearerAuth("accessToken")
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles("ADMIN")
  @ApiOperation({
    summary: "회원의 타입 변경",
    description: "회원의 타입을 수정합니다,",
  })
  @ApiParam({
    name: "id",
    description: "회원 타입 변경하고자 하는 회원의 id값",
    example: 1,
    type: "string",
  })
  @ApiBody({
    schema: {
      type: "object",
      properties: {
        userType: {
          type: "string",
          example: "ADMIN",
          description: "변경하고자 하는 유저 타입",
        },
      },
      required: ["userType"],
    },
  })
  @ApiUnauthorizedResponse({
    description: "로그인 하지 않은 경우",
    example: {
      message: "Unauthorized",
      statusCode: HttpStatus.UNAUTHORIZED,
    },
  })
  @ApiNotFoundResponse({
    description: "회원정보 없음",
    example: {
      statusCode: HttpStatus.NOT_FOUND,
      message: "Not exist user",
      error: "Not Found",
    },
  })
  @ApiUnprocessableEntityResponse({
    description: "자기 자신의 권한을 변경하려고 하는 경우",
    example: {
      statusCode: HttpStatus.UNPROCESSABLE_ENTITY,
      message: "can not change me",
      error: "Unprocessable Entity",
    },
  })
  @ApiBadRequestResponse({
    description: "유효하지 않은 userType 값",
    example: {
      statusCode: HttpStatus.BAD_REQUEST,
      message: "invalid userType",
      error: "Bad Request",
    },
  })
  @ApiConflictResponse({
    description: "변경하고자 하는 userType과 유저의 userType이 같은 경우",
    example: {
      statusCode: HttpStatus.CONFLICT,
      message: "already userType equal",
      error: "Conflict",
    },
  })
  @ApiOkResponse({
    description: "회원 타입 변경 성공",
    type: ResponseCommonSuccessDTO,
  })
  async updateUserRole(
    @Param("id", new ParseintPipe()) id: number,
    @Body("userType", new UpperCasePipe()) userType: string,
    @User() user: Payload,
  ): Promise<ResponseCommonSuccessDTO> {
    return await this.userService.updateUserRole(id, userType, user);
  }
}
