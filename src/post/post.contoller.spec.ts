import { Test, TestingModule } from "@nestjs/testing"
import { PostController } from "./post.controller"
import { PostService } from "./post.service"

describe('PostController', () => {
  let postController: PostController

  beforeEach(async() => {
    const postModule: TestingModule = await Test.createTestingModule({
      controllers: [PostController],
    }).compile()

    postController = postModule.get<PostController>(PostController)
  })


  it('should be defined', () => {
    expect(postController).toBeDefined()
  })
})