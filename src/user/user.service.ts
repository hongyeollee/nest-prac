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