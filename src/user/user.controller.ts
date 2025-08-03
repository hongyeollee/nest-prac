import {
  Body,
  Controller,
  Get,
  HttpStatus,
  Post,
  Put,
  Query,
} from "@nestjs/common";
import { UserService } from "./user.service";
import { CreateUserDTO } from "./dto/create-user.dto";
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiBody,
  ApiConflictResponse,
  ApiCreatedResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiQuery,
  ApiTags,
} from "@nestjs/swagger";
import { UserEntity } from "entities/user.entity";
import { instanceToPlain } from "class-transformer";
import { GetUserDTO } from "./dto/get-user.dto";
import { ResponseGetUserDTO } from "./dto/response-get-user.dto";
import { ResponseGetUserListDTO } from "./dto/response-get-user-list.dto";
import { UpdateUserDTO } from "./dto/update-user-dto";

@Controller("user")
@ApiTags("user")
export class UserController {
  constructor(private userService: UserService) {}

  @Get("list")
  // @ApiBearerAuth() 토근 인증 필요
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
  // @ApiBearerAuth() 토근 인증 필요
  @ApiOperation({
    summary: "회원 조회",
    description: "회원의 정보를 조회합니다.",
  })
  @ApiQuery({
    name: "email",
    type: String,
    example: "abc@def.com",
    required: true,
    description: "회원의 이메일",
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
}
