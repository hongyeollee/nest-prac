import { BadRequestException, ConflictException, Injectable, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { User } from "entities/user.entity";
import { DataSource, IsNull, Not, Repository } from "typeorm";
import { v4 as uuidv4 } from 'uuid'

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
  async selectUser(userUuid: string): Promise<any> {
    if(!userUuid) {
      throw new BadRequestException(
        'not exist userUuid parameter'
      )
    }

    const result = await this.userRepository.findOne({
      where: {
        userUuid: userUuid,
        deletedDt: IsNull(),
      }
    })
    .then( res => {
      if(!res) {
        throw new NotFoundException(
          'not exist user'
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
  async createUser(name: string, email: string, password: string) {
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

    await this.userRepository.insert({
      name,
      userUuid: uuidv4(),
      email,
      password,
    })

    return {
      message: 'success',
    }
  }
}