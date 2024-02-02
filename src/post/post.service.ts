import { BadRequestException, Injectable, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Post } from "entities/post.entity";
import { UserService } from "src/user/user.service";
import { DataSource, IsNull, Repository } from "typeorm";

@Injectable()
export class PostService {
  constructor(
    @InjectRepository(Post)
    private postRepository: Repository<Post>,

    private userService: UserService,

    private dataSource: DataSource,
  ) {}

  /**
   * 게시글 리스트 조회
   * @returns 
   */
  async selectPostList(): Promise<any> {
    const list = await this.postRepository.find({
      where: {
        deletedDt: IsNull(),
      }
    })

    return {
      list,
    }
  }

  /**
   * 게시글 상세 조회
   * @param id 
   * @returns 
   */
  async selectPost(id:number): Promise<any> {
    if(!id) {
      throw new BadRequestException(
        'not exist id parameter'
      )
    }

    const result = await this.postRepository.findOne({
      where: {
        id,
        deletedDt: IsNull(),
      }
    })
    .then(res => {
      if(!res) {
        throw new NotFoundException(
          'not exist post'
        )
      }
      return res
    })

    return result
  }

  async selectPostByUser(userUuid: string): Promise<any> {
    if(!userUuid) {
      throw new BadRequestException(
        'not exist userUuid Parameter'
      )
    }

    const user = await this.userService.selectUser(userUuid)

    const posts = await this.postRepository.find({
      where: {
        userUuid: user.userUuid
      }
    })

    const postList = []

    for(const post of posts) {
      postList.push({
        id: post.id,
        userUuid: post.userUuid,
        title: post.title,
        content: post.content,
      })
    }
    
    return {
      ...user,
      postList,
    }
  }
}