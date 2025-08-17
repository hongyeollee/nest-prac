import {
  BadRequestException,
  ConflictException,
  HttpStatus,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { UserEntity } from "entities/user.entity";
import { DataSource, IsNull, Repository } from "typeorm";
import { v4 as uuidv4 } from "uuid";
import * as bcrypt from "bcrypt";
import { CreateUserDTO } from "./dto/create-user.dto";
import { GetUserDTO } from "./dto/get-user.dto";
import { ResponseGetUserListDTO } from "./dto/response-get-user-list.dto";
import { UpdateUserDTO } from "./dto/update-user-dto";
import { ResponseCommonSuccessDTO } from "src/_common/_dto/common-success-response.dto";

@Injectable()
export class UserService {
  private userTypeList = ["ADMIN", "GENERAL"];

  constructor(
    @InjectRepository(UserEntity)
    private userRepository: Repository<UserEntity>,

    private dataSource: DataSource,
  ) {}

  /**
   * 유저 목록 조회
   * @returns
   */
  async getUserList(): Promise<ResponseGetUserListDTO> {
    const list = await this.userRepository.find({
      where: {
        deletedDt: IsNull(),
      },
    });

    return {
      list: list.map((user) => {
        const { password, posts, ...result } = user;
        return result;
      }),
    };
  }

  /**
   * 유저 상세 조회
   * @param getUserDto
   * @returns
   */
  async getUser(getUserDto: GetUserDTO): Promise<UserEntity> {
    const userInfo = await this.userRepository.findOne({
      where: {
        email: getUserDto.email,
        deletedDt: IsNull(),
      },
    });

    if (!userInfo) {
      throw new NotFoundException("Not exist user");
    }

    return userInfo;
  }

  /**
   * 유저 생성
   * @param createUserDto
   * @returns
   */
  async createUser(createUserDto: CreateUserDTO): Promise<UserEntity> {
    const { email, name, password, userType } = createUserDto;

    const role = userType ? userType.toUpperCase() : "GENERAL";

    const existed = await this.userRepository.findOne({
      where: { email },
    });
    if (existed) {
      throw new ConflictException("already exist email");
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = this.userRepository.create({
      name,
      userUuid: uuidv4(),
      email,
      userType: role,
      password: hashedPassword,
    });

    await this.userRepository.save(user);

    return user;
  }

  /**
   * 유저 정보 수정
   * @param updateUserDto
   * @returns
   */
  async updateUser(
    updateUserDto: UpdateUserDTO,
  ): Promise<ResponseCommonSuccessDTO> {
    //0. precheck
    const ExistCheckUser = await this.getUser({ email: updateUserDto.email });

    if (updateUserDto.userUuid !== ExistCheckUser.userUuid) {
      throw new BadRequestException("Not matched userUuid");
    }

    //1. updateInfo
    await this.userRepository.update(
      {
        email: ExistCheckUser.email,
      },
      {
        name: updateUserDto.name,
      },
    );

    return {
      statusCode: HttpStatus.OK,
      message: "success",
    };
  }

  async updateUserRole(
    id: number,
    userType: string,
  ): Promise<ResponseCommonSuccessDTO> {
    const existed = await this.findOneById(id);
    if (!existed) throw new NotFoundException("Not exist user");

    if (!this.userTypeList.includes(userType)) {
      throw new BadRequestException("invalid userType");
    }

    if (userType === existed.userType) {
      throw new ConflictException("already userType equal");
    }

    await this.userRepository.update({ id: existed.id }, { userType });

    return {
      message: "success",
      statusCode: HttpStatus.OK,
    };
  }

  async findOneById(id: number) {
    return await this.userRepository.findOne({
      select: [
        "id",
        "email",
        "name",
        "userType",
        "userUuid",
        "createdDt",
        "updatedDt",
      ],
      where: { id },
      withDeleted: false,
    });
  }
}
