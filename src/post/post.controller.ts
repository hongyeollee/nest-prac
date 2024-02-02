import { Controller, Get, Query } from "@nestjs/common";
import { PostService } from "./post.service";

@Controller('post')
export class PostController {
  constructor(
    private postService: PostService,
  ) {}

  @Get('list')
  async selectPostList(@Query('userUuid') userUuid: string) {
    return await this.postService.selectPostList(userUuid)
  }

  @Get()
  async selecPost(@Query('id') id: number) {
    return await this.postService.selectPost(id)
  }

  @Get('user')
  async selectPostByUser(@Query('userUuid') userUuid: string) {
    return await this.postService.selectPostByUser(userUuid)
  }
}