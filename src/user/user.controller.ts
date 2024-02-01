import { Controller, Get, Query } from "@nestjs/common";
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
  async selectUser(@Query() userUuid: string) {
    return await this.userService.selectUser(userUuid)
  }
}