import {
  Body,
  Controller,
  Get,
  HttpStatus,
  Post,
  Query,
  UseGuards,
} from "@nestjs/common";
import { PostService } from "./post.service";
import {
  ApiBearerAuth,
  ApiBody,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiOperation,
  ApiQuery,
  ApiTags,
  ApiUnauthorizedResponse,
} from "@nestjs/swagger";
import { JwtAuthGuard } from "src/auth/security/auth.guard";
import { User } from "src/auth/decorator/user.decorator";
import { Payload } from "src/auth/security/user.payload.interface";
import { instanceToPlain } from "class-transformer";
import { PostEntity } from "entities/post.entity";
@Controller("post")
@ApiTags("게시판 post")
export class PostController {
  constructor(private postService: PostService) {}

  @Post()
  @ApiBearerAuth("accessToken")
  @UseGuards(JwtAuthGuard)
  @ApiOperation({
    summary: "게시글 작성",
    description: "사용자가 게시글을 작성합니다.",
  })
  @ApiBody({
    description: "사용자가 게시글을 작성하는데 사용되는 정보입니다.",
    schema: {
      type: "object",
      properties: {
        title: {
          type: "string",
          example: "제목입니다.",
          description: "게시글의 제목을 입력합니다.",
          nullable: false,
        },
        content: {
          type: "string",
          example: "내용입니다.",
          description: "게시글의 내용을 입력합니다.",
          nullable: true,
        },
      },
      required: ["title"],
    },
  })
  @ApiCreatedResponse({
    description: "게시글 생성 성공",
    example: {
      message: "success",
      statusCode: 201,
      id: 1,
    },
  })
  @ApiUnauthorizedResponse({
    description: "로그인하지 않은 사용자가 게시글 생성하려는 경우",
    example: {
      message: "Unauthorized",
      statusCode: 401,
    },
  })
  async create(
    @User() user: Payload,
    @Body("title") title: string,
    @Body("content") content: string,
  ): Promise<{
    message: string;
    statusCode: number;
    id: number;
  }> {
    const create = await this.postService.create(user, title, content);

    /**
     * 더 큰 프로젝트를 사용하게되는 경우에는 instanceToPlain을 사용하는것보다는
     * DTO형태로 reponse형태를 만들어 필요한 부분만 처리해서 사용할 수 있도록 하는 것으로
     * 확장 처리하는 방향성 고민하는것도 괜찮은 방법일 수 있음.
     */
    const instanceToPlainCreate = instanceToPlain(create);

    return {
      message: "success",
      statusCode: HttpStatus.CREATED,
      id: instanceToPlainCreate.id,
    };
  }

  @Get("list")
  @ApiOperation({
    summary: "게시글 목록 조회",
    description: `
      게시글 목록을 조회합니다.
      목록 조회는 로그인하지 않아도 조회할 수 있습니다.
      * 목록 검색 조회는 현재는 작성자 검색에 한해서 조회 가능합니다.
    `,
  })
  @ApiQuery({
    name: "name",
    required: false,
    description: "작성자를 입력합니다.",
    schema: {
      type: "string",
      nullable: true,
      example: "강연수",
    },
  })
  @ApiOkResponse({
    description: "게시글 목록 조회 결과",
    schema: {
      type: "object",
      properties: {
        message: { type: "string", example: "success" },
        statusCode: { type: "number", example: 200 },
        list: {
          type: "array",
          items: {
            type: "object",
            properties: {
              id: { type: "number", example: 1 },
              userUuid: {
                type: "uuid",
                example: "57581e1d-ee7f-4aba-98cb-5a32dd525197",
              },
              title: { type: "string", example: "제목입니다." },
              content: { type: "string", example: "내용입니다." },
              createdDt: {
                type: "string",
                format: "date-time",
                example: "2025-12-08T10:00:00.000Z",
              },
              updatedDt: {
                type: "string",
                format: "date-time",
                example: "2025-12-08T10:00:00.000Z",
              },
              deletedDt: {
                type: "string",
                format: "date-time",
                example: null,
              },
            },
          },
        },
      },
    },
  })
  async selectPostList(@Query("name") name?: string): Promise<{
    message: string;
    statusCode: number;
    list: PostEntity[];
  }> {
    const list = await this.postService.selectPostList(name);

    return {
      message: "success",
      statusCode: HttpStatus.OK,
      list,
    };
  }

  @Get()
  async selecPost(@Query("id") id: number) {
    return await this.postService.selectPost(id);
  }

  @Get("user")
  async selectPostByUser(@Query("userUuid") userUuid: string) {
    return await this.postService.selectPostByUser(userUuid);
  }

  @Get("users")
  async selectPostListByUsers(
    @Query("offset") offset?: number,
    @Query("limit") limit?: number,
  ) {
    return await this.postService.selectPostListByUsers(offset, limit);
  }
}
