import { BadRequestException, ConflictException, Injectable, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { User } from "entities/user.entity";
import { DataSource, IsNull, Not, Repository } from "typeorm";
import { v4 as uuidv4 } from 'uuid'
import * as bcrypt from 'bcrypt'
import { UserDTO } from "./dto/user.dto";

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,

    private dataSource: DataSource,
  ) {}

  /**
   * 유저 리스트 조회
   * @returns 
   */
  async selectUserList() {
    const list = await this.userRepository.find({
      where: {
        deletedDt: IsNull() ,
      }
    })

    return {
      list,
    }
  }

  /**
   * 유저 상세 조회
   * @param userUuid 
   * @returns 
   */
  async selectUser(email: string): Promise<any> {
    if(!email) {
      throw new BadRequestException(
        'not exist email parameter'
      )
    }

    const result = await this.userRepository.findOne({
      select: [
        'id',
        'name',
        'userUuid',
        'email',
        'createdDt',
      ],
      where: {
        email,
        deletedDt: IsNull(),
      }
    })
    .then( res => {
      if(!res) {
        throw new NotFoundException(
          'Not exist user'
        )
      }
      return res
    })

    return result
  }

  /**
   * 유저 생성
   * @param name 
   * @param email 
   * @param password 
   * @returns 
   */
  async createUser(name: string, email: string, password: string): Promise<any> {
    await this.userRepository.findOne({
      where: {
        email
      }
    }).then( res => {
      if(res) {
        throw new ConflictException(
          'already exist email'
        )
      }
    })

    const hashedPassword = await bcrypt.hash(password, 10)

    await this.userRepository.insert({
      name,
      userUuid: uuidv4(),
      email,
      password: hashedPassword,
    })

    return {
      message: 'success',
    }
  }

  /**
   * 유저 정보 수정
   * @param userDto 
   * @returns 
   */
  async updateUser(userDto: UserDTO): Promise<any> {
    //0. precheck
    const ExistCheckUser = await this.selectUser(userDto.email)

    if(!userDto.name) {
      throw new BadRequestException(
        'Not exist name parameter'
      )
    }
    if(!userDto.userUuid || userDto.userUuid !== ExistCheckUser.userUuid) {
      throw new BadRequestException(
        'Not exist userUuid parameter OR Not matched userUuid'
      )
    }

    //1. updateInfo
    await this.userRepository.update(
      { 
        email: ExistCheckUser.email,
        userUuid: ExistCheckUser.userUuid,
      },
      {
        name: userDto.name,
        // updatedDt: () => 'CURRENT_TIMESTAMP', // sql에서 on update CURRENT_TIMESTAMP Extra처리로 코드 불필요해지기 때문에 주석처리
      }
    )

    return {
      message: 'success',
    }
  }
}