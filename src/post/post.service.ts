import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { PostEntity } from "entities/post.entity";
import { UserEntity } from "entities/user.entity";
import { UserService } from "src/user/user.service";
import { DataSource, IsNull, Not, Repository } from "typeorm";

@Injectable()
export class PostService {
  constructor(
    @InjectRepository(PostEntity)
    private postRepository: Repository<PostEntity>,

    private userService: UserService,

    private dataSource: DataSource,
  ) {}

  /**
   * 게시글 리스트 조회
   * @returns
   */
  async selectPostList(userUuid: string): Promise<any> {
    const queryBuilder = this.dataSource
      .createQueryBuilder()
      .select(["*"])
      .from(PostEntity, "")
      .where("deletedDt IS NULL");
    if (userUuid) {
      queryBuilder.andWhere(`userUuid = '${userUuid}'`);
    }

    const list = await queryBuilder.getRawMany();

    return {
      list,
    };
  }

  /**
   * 게시글 상세 조회
   * @param id
   * @returns
   */
  async selectPost(id: number): Promise<any> {
    if (!id) {
      throw new BadRequestException("not exist id parameter");
    }

    const result = await this.postRepository
      .findOne({
        where: {
          id,
          deletedDt: IsNull(),
        },
      })
      .then((res) => {
        if (!res) {
          throw new NotFoundException("not exist post");
        }
        return res;
      });

    return result;
  }

  /**
   * 유저가 작성한 게시글 리스트 조회
   * @param userUuid
   * @returns
   */
  async selectPostByUser(userUuid: string): Promise<any> {
    if (!userUuid) {
      throw new BadRequestException("not exist userUuid Parameter");
    }

    // const user = await this.userService.selectUser(userUuid)

    //case1. leftJoinAndSelect 메소드 사용하는 방식
    return await this.dataSource
      .getRepository(UserEntity)
      .createQueryBuilder("user")
      .leftJoinAndSelect("user.posts", "post")
      // .where(`user.userUuid = '${user.userUuid}'`)
      .andWhere("user.deletedDt IS NULL")
      .getOne();

    //case2. leftJoinAndSelect 메소드를 사용하지 않는 방식의 방식
    // const posts = await this.postRepository.find({
    //   where: {
    //     userUuid: user.userUuid
    //   }
    // })

    // const postList = []

    // for(const post of posts) {
    //   postList.push({
    //     id: post.id,
    //     userUuid: post.userUuid,
    //     title: post.title,
    //     content: post.content,
    //   })
    // }

    // return {
    //   userInfo : {
    //     ...user
    //   },
    //   postList,
    // }
  }

  /**
   * 각 유저리스트별에 해당하는 게시글 리스트 조회
   * @returns
   */
  async selectPostListByUsers(offset?: number, limit?: number): Promise<any> {
    //페이지 네이션 사용시 필요
    // if(!offset || !limit) {
    //   throw new BadRequestException('invalid offset, limit parameters')
    // }
    // if(offset < 1) {
    //   throw new BadRequestException('invalid page parameter')
    // }

    //case1. leftJoinAndSelect 쿼리 사용
    const queryBuilder = this.dataSource
      .getRepository(UserEntity)
      .createQueryBuilder("user")
      .leftJoinAndSelect("user.posts", "post")
      .where(`user.deletedDt IS NULL`);

    const list = await queryBuilder.getMany();
    const totalCount = await queryBuilder.getCount();

    //case2. for문과 spread를 사용한 두번 이상의 호출 쿼리사용
    // const users = (await this.userService.selectUserList()).list

    // const list = []

    // for(const user of users) {
    //   const postListByUser = await this.postRepository.find({
    //     where: {
    //       userUuid: user.userUuid
    //     }
    //   })

    // list.push({
    //   ... user,
    //   postListByUser
    // })
    // }

    return {
      list,
      totalCount,
    };
  }

  //여러개의 값을 한번에 불러올때 promise.all을 사용해서 성능을 효율화 하는 방법 테스트 시도
}
