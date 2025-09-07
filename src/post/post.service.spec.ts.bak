import { Test, TestingModule } from "@nestjs/testing"
import { PostService } from "./post.service"

describe('PostService', () => {
  let postService: PostService
  
  beforeEach(async () => {
    const postModule: TestingModule = await Test.createTestingModule({
      providers: [PostService]
    }).compile()

    postService = postModule.get<PostService>(PostService)
  })

  it('should be defined', () => {
    expect(postService).toBeDefined()
  })
})