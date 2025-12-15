import { Test, TestingModule } from "@nestjs/testing";
import { getRepositoryToken } from "@nestjs/typeorm";
import { DataSource, Repository } from "typeorm";
import { PostService } from "./post.service";
import { PostEntity } from "entities/post.entity";
import { PostLikeEntity } from "entities/post-like.entity";
import { UserService } from "src/user/user.service";

type MockRepository<T = any> = {
  [P in keyof Repository<T>]?: jest.Mock;
};

describe("PostService", () => {
  let postService: PostService;
  // let postRepository: any;
  let postRepository: MockRepository<PostEntity>;

  beforeEach(async () => {
    const postModule: TestingModule = await Test.createTestingModule({
      providers: [
        PostService,
        //PostEntity
        {
          provide: getRepositoryToken(PostEntity),
          useValue: {
            create: jest.fn(),
            save: jest.fn(),
          },
        },
        //PostLikeEntity
        {
          provide: getRepositoryToken(PostLikeEntity),
          useValue: {},
        },
        //userService
        {
          provide: UserService,
          useValue: {},
        },
        //dataSource
        {
          provide: DataSource,
          useValue: {},
        },
      ],
    }).compile();

    postService = postModule.get<PostService>(PostService);
    // postRepository = postModule.get(getRepositoryToken(PostEntity));
    postRepository = postModule.get<MockRepository<PostEntity>>(
      getRepositoryToken(PostEntity),
    );
  });

  // it("should be defined", () => {
  //   expect(postService).toBeDefined();
  // });
  it("create post", async () => {
    const user = { userUuid: "abc-123" };
    const dto = { title: "제목입니다", content: "내용입니다." };
    const create = { id: 1, ...dto, userUuid: user.userUuid };

    postRepository.create!.mockReturnValue(create);
    postRepository.save!.mockResolvedValue(create);

    const result = await postService.create(
      user as any,
      dto.title,
      dto.content,
    );

    expect(postRepository.create).toHaveBeenCalledWith({
      title: dto.title,
      content: dto.content,
      userUuid: user.userUuid,
    });
    expect(postRepository.save).toHaveBeenCalledWith(create);
    expect(result).toEqual(create);
  });
});
