import { BadRequestException, Injectable, UnprocessableEntityException } from "@nestjs/common";
import { UserService } from "src/user/user.service";
import { DataSource } from "typeorm";
import * as bcrypt from 'bcrypt'
import { JwtService } from "@nestjs/jwt";

@Injectable()
export class AuthService {
  constructor(
    
    private dataSource: DataSource,

    private userService: UserService,
    private jwtService: JwtService,
  ) {}

  async login(email: string, password: string): Promise<any> {
    //0. precheck
    if(!password) {
      throw new BadRequestException(
        'not exist password parameter'
      )
    }

    //1. check user(+ precheck email)
    const userInfo = await this.userService.selectUser(email)

    //2. check password
    const checkPassword = await bcrypt.compare(password, userInfo.password)

    if(!checkPassword) {
      throw new UnprocessableEntityException(
        'not matched password'
      )
    }

    //3. issue token
    const accessToken = this.jwtService.sign({
      id: userInfo.id,
      userUuid: userInfo.userUuid,
      name: userInfo.name,
      email: userInfo.email,
    })
    
    return {
      accessToken,
    }
  }
}