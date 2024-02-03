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
  async selectPostList(userUuid: string): Promise<any> {
    const queryBuilder = this.dataSource.createQueryBuilder()
      .select(['*'])
      .from(Post, '')
      .where('deletedDt IS NULL')
      if(userUuid) {
        queryBuilder
          .andWhere(`userUuid = '${userUuid}'`)
      }

    const list = await queryBuilder.getRawMany()

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

  /**
   * 유저가 작성한 게시글 리스트 조회
   * @param userUuid 
   * @returns 
   */
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
      userInfo : {
        ...user 
      },
      postList,
    }
  }

  /**
   * 각 유저리스트별에 해당하는 게시글 리스트 조회
   * @returns 
   */
  async selectPostListByUsers() {
    const users = (await this.userService.selectUserList()).list

    const postListByUserUuid = []

    for(const user of users) {
      const postByUser = await this.postRepository.find({
        where: {
          userUuid: user.userUuid
        }
      })

    postListByUserUuid.push(postByUser)
    }

    return {
      users,
      postListByUserUuid,
    }
  }
}