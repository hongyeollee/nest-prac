import {
  Inject,
  Injectable,
  InternalServerErrorException,
  Logger,
  NotFoundException,
  UnauthorizedException,
  UnprocessableEntityException,
} from "@nestjs/common";
import { UserService } from "src/user/user.service";
import { DataSource } from "typeorm";
import * as bcrypt from "bcrypt";
import { JwtService } from "@nestjs/jwt";
import { Payload } from "./security/user.payload.interface";
import { UserEntity } from "entities/user.entity";
import { LoginDTO } from "./_dto/login.dto";
import { AuthUtil } from "./auth.util";
import { EmailService } from "src/mail/mail.service";

@Injectable()
export class AuthService {
  private logger = new Logger(AuthService.name, { timestamp: true });
  constructor(
    private readonly dataSource: DataSource,

    private readonly userService: UserService,
    private readonly jwtService: JwtService,
    private readonly authUtil: AuthUtil,
    private readonly emailService: EmailService,
  ) {}

  /**
   * 유저 로그인
   * @param email
   * @param password
   * @returns
   */
  async login(loginDto: LoginDTO): Promise<{
    accessToken: string;
    refreshToken: string;
    payload: {
      id: number;
      userUuid: string;
      name: string;
      email: string;
    };
  }> {
    const { email, password } = loginDto;
    //1. check user(+ precheck email)
    const userInfo = await this.userService.getUser({ email });

    //2. check password
    const checkPassword = await bcrypt.compare(password, userInfo.password);

    if (!checkPassword) {
      throw new UnprocessableEntityException("not matched password");
    }

    // +@ 로그인할때 payload정보도 같이 주기 위한 호출 추가

    /**
     * pick case(createQueryBuilder.select() 케이스)
     * 주의: getOne(), manage.findOne과 같이 엔티티를 직접적으로 주입받는 경우
     * console값이
     * Entity {} 의 형태로 리턴되기 때문에 에러가 발생할 수 있기때문에 사용방법에 대해서 getRawOne()을 사용하게된점
     * 인지하고 작업을 하는 것이 방향성을 잡는데 도움이 된다.
     */
    const user = await this.dataSource
      .createQueryBuilder()
      .select(["id", "userUuid", "name", "email"])
      .from(UserEntity, "")
      .where("email = :email", { email })
      .getRawOne();

    const payload: Payload = user;

    const accessToken = this.jwtService.sign(user, { expiresIn: "15m" });
    const refreshToken = this.jwtService.sign(user, { expiresIn: "7d" });

    /**
     * redis에 refrshToken 저장
     */
    if (await this.authUtil.getRefreshTokenByRedis(user.userUuid)) {
      await this.authUtil.delRefreshTokenByRedis(user.userUuid);
    }
    await this.authUtil.setRefreshTokenByRedis(refreshToken, user.userUuid);

    //3. token(accessToken, refreshToken) issue, return payload
    return {
      accessToken,
      refreshToken,
      payload,
    };
  }

  /**
   * refreshToken으로 accessToken 재발급
   * @param refreshToken
   * @returns
   */
  async refreshAccessToken(refreshToken: string) {
    const payloadRefreshToken = this.verifyRefreshToken(refreshToken);

    const user = await this.userService.getUser({
      email: payloadRefreshToken.email,
    });

    if (!user) throw new UnauthorizedException();

    const payload: Payload = {
      id: user.id,
      email: user.email,
      name: user.name,
      userUuid: user.userUuid,
    };

    const newAccessToken = this.jwtService.sign(payload, { expiresIn: "15m" });
    const newRefreshToken = this.jwtService.sign(payload, { expiresIn: "7d" });

    //redis추가로 인해 refreshToken 메모리DB에 추가
    // 1. 기존 refreshToken 데이터 제거
    await this.authUtil.delRefreshTokenByRedis(user.userUuid);
    // 2. 새로 refreshToken 데이터 추가
    await this.authUtil.setRefreshTokenByRedis(newRefreshToken, user.userUuid);

    return {
      accessToken: newAccessToken,
      refreshToken: newRefreshToken,
    };
  }

  /**
   * 유저의 토큰 유효성 검사
   * @param payload
   * @returns
   */
  async tokenValidateUser(payload: Payload | undefined): Promise<any> {
    const jwt = await this.dataSource
      .createQueryBuilder()
      .select(["id", "userUuid", "name", "email"])
      .from(UserEntity, "")
      .where(`email = '${payload.email}'`)
      .getRawOne();

    if (!jwt) {
      throw new NotFoundException(
        "Can not found user info at tokenValidateUser.",
      );
    }

    return {
      payload: jwt,
    };
  }

  /**
   * 회원이 비밀번호 모르는 경우 자동 비밀번호 변경
   * @param email
   * @returns
   */
  async autoUpdatePassword(email: string): Promise<void> {
    //회원정보 유무 조회
    const user = await this.userService.getUser({ email });

    const newPassword = this.authUtil.generateRandomString(10);

    //새로운 비밀번호 암호화
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    /**
     * 외부 API(emailService)와 비밀번호 수정 쿼리를 트랜잭션으로 묶은 이유
     * -> 회원 임시 비밀번호 데이터가 변경됐는데 이메일을 받지 못하면 회원은 변경된 비밀번호를 받을 수 없다.
     * 서비스 로직상 잘못된 경우 비밀번호가 원상태로 롤백되도록 하는것이 중요하기 때문에 트랜잭션을 사용.
     */
    try {
      //회원의 비밀번호 DB에서 수정
      await queryRunner.manager.update(
        UserEntity,
        { email: user.email },
        {
          password: hashedPassword,
        },
      );

      //newPassword에 대한 정보 회원의 이메일로 발송
      await this.emailService.sendEmailAuthentication(email, newPassword);

      await queryRunner.commitTransaction();

      return;
    } catch (error) {
      this.logger.error(error);
      await queryRunner.rollbackTransaction();
      throw new InternalServerErrorException("fail auto update password");
    } finally {
      await queryRunner.release();
    }
  }

  verifyRefreshToken(refreshToken: string) {
    return this.jwtService.verify(refreshToken);
  }
}
