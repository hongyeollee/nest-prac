import { Controller, Get, Query } from "@nestjs/common";
import { PostService } from "./post.service";

@Controller('post')
export class PostController {
  constructor(
    private postService: PostService,
  ) {}

  @Get('list')
  async selectPostList() {
    return await this.postService.selectPostList()
  }

  @Get()
  async selecPost(@Query('id') id: number) {
    return await this.postService.selectPost(id)
  }
}