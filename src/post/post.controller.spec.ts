import { HttpStatus } from "@nestjs/common";
import { Test, TestingModule } from "@nestjs/testing";
import { PostController } from "./post.controller";
import { PostService } from "./post.service";
import { Payload } from "src/auth/security/user.payload.interface";

describe("PostController", () => {
  let postController: PostController;
  let postService: PostService;

  beforeEach(async () => {
    const postModule: TestingModule = await Test.createTestingModule({
      controllers: [PostController],
      providers: [
        {
          provide: PostService,
          useValue: {
            create: jest.fn(),
          },
        },
      ],
    }).compile();

    postController = postModule.get<PostController>(PostController);
    postService = postModule.get(PostService);
  });

  it("게시글 생성 성공 시, 서비스 호출 및 응답 형태를 리턴한다.", async () => {
    const user: Payload = { userUuid: "abc-123" } as any;
    const title = "제목입니다.";
    const content = "내용입니다.";

    const createPost = {
      id: 1,
      title,
      content,
      userUuid: user.userUuid,
    };

    (postService.create as jest.Mock).mockResolvedValue(createPost);
    const result = await postController.create(user, title, content);

    expect(postService.create).toHaveBeenCalledWith(user, title, content);
    expect(result).toEqual({
      message: "success",
      statusCode: HttpStatus.CREATED,
      id: createPost.id,
    });
  });

  // it("should be defined", () => {
  //   expect(postController).toBeDefined();
  // });
});
