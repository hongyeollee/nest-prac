import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  HttpStatus,
  Param,
  Post,
  Put,
  Query,
  UseGuards,
} from "@nestjs/common";
import { PostService } from "./post.service";
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiBody,
  ApiCreatedResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiResponse,
  ApiTags,
  ApiUnauthorizedResponse,
} from "@nestjs/swagger";
import { JwtAuthGuard } from "src/auth/security/auth.guard";
import { User } from "src/auth/decorator/user.decorator";
import { Payload } from "src/auth/security/user.payload.interface";
import { instanceToPlain } from "class-transformer";
import { PostEntity } from "entities/post.entity";
import { UpdateResult } from "typeorm";
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
    name: "page",
    required: true,
    description: "페이지 번호",
    schema: {
      type: "number",
      nullable: false,
      example: 1,
      default: 1,
    },
  })
  @ApiQuery({
    name: "limit",
    required: true,
    description: "페이지에 불러올 데이터 개수",
    schema: {
      type: "number",
      nullable: false,
      example: 10,
      default: 10,
    },
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
                type: "string",
                format: "uuid",
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
        totalCount: {
          type: "number",
          example: 1004,
        },
      },
    },
  })
  async selectPostList(
    @Query("page") page: number = 1,
    @Query("limit") limit: number = 10,
    @Query("name") name?: string,
  ): Promise<{
    message: string;
    statusCode: number;
    list: PostEntity[];
    totalCount: number;
  }> {
    const list = await this.postService.selectPostList(page, limit, name);

    return {
      message: "success",
      statusCode: HttpStatus.OK,
      list: list.list,
      totalCount: list.totalCount,
    };
  }

  @Get()
  @ApiBearerAuth("accessToken")
  @UseGuards(JwtAuthGuard)
  @ApiOperation({
    summary: "게시글 상세조회",
    description: "사용자가 단일 게시글을 상세조회합니다.",
  })
  @ApiQuery({
    description: "게시글의 id",
    name: "id",
    type: "number",
    example: 1,
  })
  @ApiUnauthorizedResponse({
    description: "로그인하지 않은 사용자가 게시글을 조회하려는 경우",
    example: {
      statusCode: 401,
      statusText: "UNAUTHORIZED",
      message: "Unauthorized",
      timestamp: "2025-12-08T05:52:00.607Z",
      path: "/api/post?id=100",
    },
  })
  @ApiNotFoundResponse({
    description: "존재하지 않는 게시글을 조회하는 경우",
    example: {
      statusCode: 404,
      statusText: "NOT_FOUND",
      message: "not exist post",
      timestamp: "2025-12-08T05:53:22.382Z",
      path: "/api/post?id=100",
    },
  })
  @ApiBadRequestResponse({
    description:
      "게시글 id값 파라미터를 받지 못한 경우(id 파라미터는 필수 값입니다.)",
    example: {
      statusCode: 400,
      statusText: "BAD_REQUEST",
      message: "not exist id parameter",
      timestamp: "2025-12-08T05:53:22.382Z",
      path: "/api/post?id=100",
    },
  })
  @ApiOkResponse({
    description: "게시글 상세조회 결과",
    schema: {
      type: "object",
      properties: {
        message: { type: "string", example: "success" },
        statusCode: { type: "number", example: 200 },
        info: {
          type: "object",
          properties: {
            id: { type: "number", example: 1 },
            userUuid: {
              type: "string",
              format: "uuid",
              example: "57581e1b-ea7d-5abh-98cb-5a32dd525193",
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
            user: {
              type: "object",
              properties: {
                userUuid: {
                  type: "string",
                  format: "uuid",
                  example: "57581e1b-ea7d-5abh-98cb-5a32dd525193",
                },
                userType: {
                  type: "string",
                  example: "GENERAL",
                },
                name: {
                  type: "string",
                  example: "홍길동",
                },
                email: {
                  type: "string",
                  example: "hong@example.com",
                },
              },
            },
          },
        },
      },
    },
  })
  async selecPost(@Query("id") id: number): Promise<{
    message: string;
    statusCode: HttpStatus;
    info: PostEntity;
  }> {
    const post = await this.postService.selectPost(id);

    return {
      message: "success",
      statusCode: HttpStatus.OK,
      info: post,
    };
  }

  @Delete()
  @ApiBearerAuth("accessToken")
  @UseGuards(JwtAuthGuard)
  @ApiOperation({
    summary: "게시글 삭제",
    description: `
      게시글을 삭제합니다.
      게시글 삭제는 ADMIN과 작성자 본인만 삭제 가능합니다.
    `,
  })
  @ApiQuery({
    description: "게시글의 id",
    name: "id",
    type: "number",
    example: 1,
  })
  @ApiUnauthorizedResponse({
    description: "로그인하지 않은 사용자가 게시글을 조회하려는 경우",
    example: {
      statusCode: 401,
      statusText: "UNAUTHORIZED",
      message: "Unauthorized",
      timestamp: "2025-12-08T05:52:00.607Z",
      path: "/api/post?id=100",
    },
  })
  @ApiOkResponse({
    description: "게시글 삭제 성공",
    schema: {
      type: "object",
      properties: {
        message: { type: "string", example: "success" },
        statusCode: { type: "numebr", example: 200 },
        info: {
          type: "object",
          properties: {
            generatedMaps: { type: "array", example: [] },
            raw: { type: "array", example: [] },
            affected: { type: "number", example: 1 },
          },
        },
      },
    },
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: "잘못된 요청 발생 케이스들",
    content: {
      "application/json": {
        examples: {
          softDeleteFail: {
            summary: "게시글 삭제 실패",
            value: {
              statusCode: HttpStatus.BAD_REQUEST,
              statusText: "BAD_REQUEST",
              message: "fail delete",
              timestamp: "2025-12-09T02:22:55.812Z",
              path: "/api/post?id=2",
            },
          },
          notExistedIdParameter: {
            summary: "id 파라미터 없는 경우",
            value: {
              statusCode: HttpStatus.BAD_REQUEST,
              statusText: "BAD_REQUEST",
              message: "not exist id parameter",
              timestamp: "2025-12-09T02:22:55.812Z",
              path: "/api/post?id=2",
            },
          },
          notEqualUser: {
            summary: "ADMIN 또는 게시글 작성자가 아닌 사람이 삭제하는 경우",
            value: {
              statusCode: HttpStatus.BAD_REQUEST,
              statusText: "BAD_REQUEST",
              message: "not equal user",
              timestamp: "2025-12-09T02:22:55.812Z",
              path: "/api/post?id=2",
            },
          },
        },
      },
    },
  })
  @ApiNotFoundResponse({
    description: "존재하지 않는 게시글을 조회하는 경우",
    example: {
      statusCode: 404,
      statusText: "NOT_FOUND",
      message: "not exist post",
      timestamp: "2025-12-08T05:53:22.382Z",
      path: "/api/post?id=100",
    },
  })
  async softDeletePost(
    @User() user: Payload,
    @Query("id") id: number,
  ): Promise<{
    message: string;
    statusCode: number;
    info: UpdateResult;
  }> {
    const softDelete = await this.postService.softDeletePost(user, id);

    if (softDelete.affected !== 1) throw new BadRequestException("fail delete");

    return {
      message: "success",
      statusCode: HttpStatus.OK,
      info: softDelete,
    };
  }

  @Put(":id")
  @ApiBearerAuth("accessToken")
  @UseGuards(JwtAuthGuard)
  @ApiOperation({
    summary: "게시글 수정",
    description: "사용자가 게시글을 수정합니다.",
  })
  @ApiParam({
    name: "id",
    required: true,
    description: "수정할 게시글 id",
    schema: { type: "int", example: 1 },
  })
  @ApiBody({
    description: "사용자가 게시글의 제목 또는 내용을 수정하는 정보입니다.",
    schema: {
      type: "object",
      properties: {
        title: {
          type: "string",
          example: "제목을 수정합니다.",
          description: "게시글의 제목을 수정합니다.",
          nullable: true,
        },
        content: {
          type: "string",
          example: "내용입니다.",
          description: "게시글의 내용을 수정합니다.",
          nullable: true,
        },
      },
    },
  })
  @ApiUnauthorizedResponse({
    description: "로그인하지 않은 사용자가 게시글을 조회하려는 경우",
    example: {
      statusCode: 401,
      statusText: "UNAUTHORIZED",
      message: "Unauthorized",
      timestamp: "2025-12-08T05:52:00.607Z",
      path: "/api/post/100",
    },
  })
  @ApiOkResponse({
    description: "게시글 수정 성공",
    schema: {
      type: "object",
      properties: {
        message: { type: "string", example: "success" },
        statusCode: { type: "numebr", example: 200 },
        info: {
          type: "object",
          properties: {
            generatedMaps: { type: "array", example: [] },
            raw: { type: "array", example: [] },
            affected: { type: "number", example: 1 },
          },
        },
      },
    },
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: "잘못된 요청 발생 케이스들",
    content: {
      "application/json": {
        examples: {
          softDeleteFail: {
            summary: "게시글 수정 실패",
            value: {
              statusCode: HttpStatus.BAD_REQUEST,
              statusText: "BAD_REQUEST",
              message: "fail delete",
              timestamp: "2025-12-09T02:22:55.812Z",
              path: "/api/post/2",
            },
          },
          notExistedIdParameter: {
            summary: "id 파라미터 없는 경우",
            value: {
              statusCode: HttpStatus.BAD_REQUEST,
              statusText: "BAD_REQUEST",
              message: "not exist id parameter",
              timestamp: "2025-12-09T02:22:55.812Z",
              path: "/api/post/2",
            },
          },
          notEqualUser: {
            summary: "ADMIN 또는 게시글 작성자가 아닌 사람이 수정하는 경우",
            value: {
              statusCode: HttpStatus.BAD_REQUEST,
              statusText: "BAD_REQUEST",
              message: "not equal user",
              timestamp: "2025-12-09T02:22:55.812Z",
              path: "/api/post/2",
            },
          },
        },
      },
    },
  })
  @ApiNotFoundResponse({
    description: "존재하지 않는 게시글을 조회하는 경우",
    example: {
      statusCode: 404,
      statusText: "NOT_FOUND",
      message: "not exist post",
      timestamp: "2025-12-08T05:53:22.382Z",
      path: "/api/post/100",
    },
  })
  async updatePost(
    @User() user: Payload,
    @Param("id") id: number,
    @Body("title") title?: string,
    @Body("content") content?: string,
  ) {
    const udpate = await this.postService.updatePost(user, id, title, content);
    if (udpate.affected !== 1) throw new BadRequestException("fail delete");

    return {
      message: "success",
      statusCode: HttpStatus.OK,
      info: udpate,
    };
  }

  @Post(":postId/like")
  @ApiBearerAuth("accessToken")
  @UseGuards(JwtAuthGuard)
  @ApiOperation({
    summary: "게시글 좋아요/좋아요 해제",
    description: `
      특정 게시글에 대해 현재 사용자의 좋아요 상태를 토글합니다.
      - 처음 요청 및 좋아요 해지 후 다시 좋아요: 좋아요 등록 (true 반환)
      - 좋아요가 이미 된 상태에서 다시 요청: 좋아요 해제 (false 반환)
    `,
  })
  @ApiParam({
    name: "postId",
    required: true,
    description: "좋아요를 토글할 게시글 id",
    schema: { type: "integer", example: 1 },
  })
  @ApiUnauthorizedResponse({
    description: "로그인하지 않은 사용자가 게시글을 조회하려는 경우",
    example: {
      statusCode: 401,
      statusText: "UNAUTHORIZED",
      message: "Unauthorized",
      timestamp: "2025-12-08T05:52:00.607Z",
      path: "/api/post/100/like",
    },
  })
  @ApiOkResponse({
    description: "좋아요 토글 결과",
    schema: {
      type: "object",
      properties: {
        message: { type: "string", example: "success" },
        statusCode: { type: "number", example: 200 },
        isLiked: {
          type: "boolean",
          example: true,
          description:
            "현재 기준 좋아요 상태 (true: 좋아요됨, false: 좋아요 해제됨)",
        },
      },
    },
  })
  @ApiNotFoundResponse({
    description: "존재하지 않는 게시글을 조회하는 경우",
    example: {
      statusCode: 404,
      statusText: "NOT_FOUND",
      message: "not exist post",
      timestamp: "2025-12-08T05:53:22.382Z",
      path: "/api/post/100/like",
    },
  })
  async likePost(
    @User() user: Payload,
    @Param("postId") postId: number,
  ): Promise<{ message: string; statusCode: number; isLiked: boolean }> {
    const postLike = await this.postService.postLike(user, postId);

    return {
      message: "success",
      statusCode: HttpStatus.OK,
      isLiked: postLike,
    };
  }

  /**
   * 미사용
   * @param userUuid
   * @returns
   */
  @Get("user")
  @ApiOperation({
    summary: "게시글 리스트 조회",
    deprecated: true,
    description: "사용하지 않는 api 입니다.",
  })
  async selectPostByUser(@Query("userUuid") userUuid: string) {
    return await this.postService.selectPostByUser(userUuid);
  }

  /**
   * 미사용
   * @param offset
   * @param limit
   * @returns
   */
  @Get("users")
  @ApiOperation({
    summary: "각 유저리스트별에 해당하는 게시글 리스트 조회",
    deprecated: true,
    description: "사용하지 않는 api 입니다.",
  })
  async selectPostListByUsers(
    @Query("offset") offset?: number,
    @Query("limit") limit?: number,
  ) {
    return await this.postService.selectPostListByUsers(offset, limit);
  }
}
