import { Body, Controller, Get, Post, Put, Query } from "@nestjs/common";
import { UserService } from "./user.service";
import { UserDTO } from "./dto/user.dto";

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
  async selectUser(@Query('email') email: string) {
    return await this.userService.selectUser(email)
  }

  @Post()
  async createUser(
    @Body('name') name: string,
    @Body('email') email: string,
    @Body('password') password: string,
  ) {
    return await this.userService.createUser(name, email, password)
  }

  @Put()
  async updateUser(@Body() userDto: UserDTO) {
    return await this.userService.updateUser(userDto)
  }
}