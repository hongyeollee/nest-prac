import { BadRequestException, Injectable, NotFoundException, UnprocessableEntityException } from "@nestjs/common";
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

    // +@ 로그인할때 payload정보도 같이 주기 위한 호출 추가

    /**
     * pick case(createQueryBuilder.select() 케이스)
     * 주의: getOne(), manage.findOne과 같이 엔티티를 직접적으로 주입받는 경우
     * console값이
     * Entity {} 의 형태로 리턴되기 때문에 에러가 발생할 수 있기때문에 사용방법에 대해서 getRawOne()을 사용하게된점
     * 인지하고 작업을 하는 것이 방향성을 잡는데 도움이 된다.
     */
    const user = await this.dataSource.createQueryBuilder()
      .select([
        'id',
        'userUuid',
        'name',
        'email',
      ])
      .from(User, '')
      .where(`email = '${email}'`)
      .getRawOne()

    const payload: Payload = user

    //3. token issue, return payload
    return {
      accessToken: this.jwtService.sign(user),
      payload,
    }
  }

  /**
   * 유저의 토큰 유효성 검사
   * @param payload 
   * @returns 
   */
  async tokenValidateUser(payload: Payload | undefined): Promise<any> {
    const jwt = await this.dataSource.createQueryBuilder()
      .select([
        'id',
        'userUuid',
        'name',
        'email',
      ])
      .from(User, '')
      .where(`email = '${payload.email}'`)
      .getRawOne()

    if(!jwt) {
      throw new NotFoundException(
        'Can not found user info at tokenValidateUser.'
      )
    }

    return {
      payload: jwt
    }
  }
}