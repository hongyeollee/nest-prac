import { Body, Controller, Get, Post, Query } from "@nestjs/common";
import { UserService } from "./user.service";

@Controller('user')
export class UserController {
  constructor(
    private userService: UserService,
  ) {}
  
  @Get('list')
  async selectUserList() {
    return await this.userService.selectUserList()
  }

  @Get()
  async selectUser(@Query('userUuid') userUuid: string) {
    return await this.userService.selectUser(userUuid)
  }

  @Post()
  async createUser(
    @Body('name') name: string ,
    @Body('email') email: string,
    @Body('password') password: string
  ) {
    return await this.userService.createUser(name, email, password)
  }
}