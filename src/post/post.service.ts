import { BadRequestException, Injectable, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Post } from "entities/post.entity";
import { DataSource, IsNull, Repository } from "typeorm";

@Injectable()
export class PostService {
  constructor(
    @InjectRepository(Post)
    private postRepository: Repository<Post>,

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
}