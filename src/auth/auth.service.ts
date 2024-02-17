import { BadRequestException, Injectable, UnprocessableEntityException } from "@nestjs/common";
import { UserService } from "src/user/user.service";
import { DataSource } from "typeorm";
import * as bcrypt from 'bcrypt'
import { JwtService } from "@nestjs/jwt";
import { Payload } from "./security/user.payload.interface";
import { User } from "entities/user.entity";

@Injectable()
export class AuthService {
  constructor(
    
    private dataSource: DataSource,

    private userService: UserService,
    private jwtService: JwtService,
  ) {}

    /**
     * 유저 로그인
     * @param email 
     * @param password 
     * @returns 
     */
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

    //+@ 로그인할때 payload정보도 같이 주기 위한 호출 추가
    const payload: Payload = await this.dataSource.manager.findOne(
      User,
      {
        select: [
          'id',
          'userUuid',
          'name',
          'email',
        ],
        where: {
          email,
        }
      }
    )
    
    return {
      message:'success',
      accessToken,
      payload,
    }
  }

  /**
   * 유저의 토큰 유효성 검사
   * @param payload 
   * @returns 
   */
  async tokenValidateUser(payload: Payload | undefined): Promise<any> {
    const jwt = await this.dataSource.manager.findOne(
      User,
      {
        select: [
          'id',
          'userUuid',
          'name',
          'email',
        ],
        where: {
          email: payload.email,
        }
      }
    )

    return {
      payload: jwt
    }
  }
}