import {
  BadRequestException,
  Injectable,
  NotAcceptableException,
  NotFoundException,
} from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { PostEntity } from "entities/post.entity";
import { UserEntity } from "entities/user.entity";
import { Payload } from "src/auth/security/user.payload.interface";
import { UserService } from "src/user/user.service";
import { DataSource, IsNull, Repository, UpdateResult } from "typeorm";

@Injectable()
export class PostService {
  constructor(
    @InjectRepository(PostEntity)
    private postRepository: Repository<PostEntity>,

    private userService: UserService,

    private dataSource: DataSource,

    /**
     * userRepository는 user서비스에서 getUser메소드 로직 개선되면 삭제
     * 삭제된 userRepository 관련 부분은 userService에서 의존받아 사용할 수 있도록 처리
     */
    @InjectRepository(UserEntity)
    private userRepository: Repository<UserEntity>,
  ) {}

  /**
   * 게시글 생성
   */
  async create(
    user: Payload,
    title: string,
    content: string,
  ): Promise<PostEntity> {
    const post = this.postRepository.create({
      title,
      content,
      userUuid: user.userUuid,
    });

    const create = await this.postRepository.save(post);

    return create;
  }

  /**
   * 게시글 리스트 조회
   * @param name
   * @returns
   */
  async selectPostList(
    page: number,
    limit: number,
    name?: string,
  ): Promise<{
    list: PostEntity[];
    totalCount: number;
  }> {
    let userUuid: string | undefined;
    if (name) {
      const userInfo = await this.getUserInfoByName(name);
      if (!userInfo) throw new NotFoundException("not exist user");
      userUuid = userInfo.userUuid;
    }

    const queryBuilder = this.dataSource
      .createQueryBuilder()
      .select(["*"])
      .from(PostEntity, "post")
      .where("post.deletedDt IS NULL");
    if (name) {
      queryBuilder.andWhere("post.userUuid = :userUuid", { userUuid });
    }
    queryBuilder
      .offset((page - 1) * limit)
      .limit(limit)
      .orderBy("post.createdDt", "DESC");

    const list = await queryBuilder.getRawMany();
    const totalCount = await queryBuilder.getCount();

    return {
      list,
      totalCount,
    };
  }

  /**
   * 게시글 상세 조회
   * @param id
   * @returns
   */
  async selectPost(id: number): Promise<PostEntity> {
    if (!id) {
      throw new BadRequestException("not exist id parameter");
    }

    const post = await this.postRepository.findOne({
      where: {
        id,
        deletedDt: IsNull(),
        user: {
          deletedDt: IsNull(),
        },
      },
      relations: {
        user: true,
      },
      select: {
        id: true,
        userUuid: true,
        title: true,
        content: true,
        createdDt: true,
        updatedDt: true,
        user: {
          userUuid: true,
          userType: true,
          name: true,
          email: true,
        },
      },
    });

    if (!post) throw new NotFoundException("not exist post");

    return post;
  }

  /**
   * 게시글 논리삭제
   * @param id
   * @returns
   */
  async softDeletePost(user: Payload, id: number): Promise<UpdateResult> {
    const post = await this.selectPost(id);
    this.assertOwnership(user, post.userUuid);

    const softDelete = await this.postRepository.softDelete({
      id: post.id,
    });

    return softDelete;
  }

  /**
   * 게시글 수정
   * @param user
   * @param id
   * @param title
   * @param content
   * @returns
   */
  async updatePost(
    user: Payload,
    id: number,
    title?: string,
    content?: string,
  ): Promise<UpdateResult> {
    const post = await this.selectPost(id);
    this.assertOwnership(user, post.userUuid);

    const updateData: Partial<PostEntity> = {};
    if (title) updateData.title = title;
    else updateData.title = post.title;
    if (content) updateData.content = content;
    if (Object.keys(updateData).length === 0) {
      throw new NotAcceptableException("no update");
    }

    const update = await this.postRepository.update({ id }, updateData);
    return update;
  }

  /**
   * 유저가 작성한 게시글 리스트 조회
   * (현재 deprecate)
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
   * (현재 deprecate)
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

  /**
   * 임시 메소드. userRepository 관련 처리되면 메소드 삭제하고
   * userService에서 의존받아서 사용할 수 있도록 처리.
   */
  private async getUserInfoByName(name: string): Promise<UserEntity> {
    return await this.userRepository.findOne({
      where: { name, deletedDt: IsNull() },
    });
  }

  private assertOwnership(user: Payload, postUserUuid: string): void {
    const isAdmin = user.userType === "ADMIN";
    const isOwner = user.userUuid === postUserUuid;
    if (!isAdmin && !isOwner) throw new BadRequestException("not equal user");
  }
}
