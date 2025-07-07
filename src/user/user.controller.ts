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
import { UserDTO } from "./dto/user.dto";
import { CreateUserDTO } from "./dto/create-user.dto";
import {
  ApiConflictResponse,
  ApiCreatedResponse,
  ApiOperation,
  ApiTags,
} from "@nestjs/swagger";
import { User } from "entities/user.entity";
import { instanceToPlain } from "class-transformer";

@Controller("user")
@ApiTags("user")
export class UserController {
  constructor(private userService: UserService) {}

  @Get("list")
  async selectUserList() {
    return await this.userService.selectUserList();
  }

  @Get()
  async selectUser(@Query("email") email: string) {
    return await this.userService.selectUser(email);
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
    type: User,
    example: {
      userUuid: "d3e3dcb5-b123-456f-bc66-7b6d3b456789",
      name: "김아무개",
      email: "abc@example.com",
      createdDt: "2025-07-07T05:55:00.000Z",
    },
  })
  async createUser(
    @Body() createUserDto: CreateUserDTO,
  ): Promise<Partial<User>> {
    const user = await this.userService.createUser(createUserDto);
    return instanceToPlain(user);
  }

  @Put()
  async updateUser(@Body() userDto: UserDTO) {
    return await this.userService.updateUser(userDto);
  }
}
