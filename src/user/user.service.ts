import { Injectable, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { User } from "entities/user.entity";
import { DataSource, IsNull, Not, Repository } from "typeorm";

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
    const result = await this.userRepository.findOne({
      where: {
        userUuid: userUuid,
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
}