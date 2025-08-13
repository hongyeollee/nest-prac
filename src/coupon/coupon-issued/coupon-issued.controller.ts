import {
  Body,
  Controller,
  Get,
  HttpStatus,
  Post,
  Query,
  UseGuards,
} from "@nestjs/common";
import {
  ApiBearerAuth,
  ApiBody,
  ApiConflictResponse,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiOperation,
  ApiQuery,
  ApiResponse,
  ApiTags,
  ApiUnauthorizedResponse,
} from "@nestjs/swagger";
import { CouponIssuedService } from "./coupon-issued.service";
import { JwtAuthGuard } from "src/auth/security/auth.guard";
import { CreateCouponIssueByUserDTO } from "../_dto/create-coupon-issue-by-user.dto";
import { Payload } from "src/auth/security/user.payload.interface";
import { User } from "src/auth/user.decorator";
import { CreateLimitCouponIssueByUserDTO } from "../_dto/create-limit-coupon-issue-by-user.dto";
import { ResponseCommonSuccessDTO } from "src/_common/_dto/common-success-response.dto";
import { ResponseSuccessGetMyCouponListDTO } from "../_dto/reponse-success-get-my-coupon-list-dto";

@Controller("coupon-issued")
@ApiTags("coupon-issued")
export class CouponIssuedController {
  constructor(private readonly couponIssuedService: CouponIssuedService) {}

  /**
   * 유저별 일반 쿠폰 발행 생성(생성시 로그 생성)
   */
  @Post("general")
  @ApiBearerAuth("accessToken")
  @UseGuards(JwtAuthGuard)
  @ApiOperation({
    summary: "유저 일반쿠폰 발급",
    description: "유저에게 특정 일반쿠폰을 발급해줍니다.",
  })
  @ApiBody({
    description: "특정 쿠폰을 특정 유저에게 발급할때 사용되는 정보입니다.",
    required: true,
    type: CreateCouponIssueByUserDTO,
  })
  @ApiUnauthorizedResponse({
    description: "로그인 하지 않은 경우",
    example: {
      message: "Unauthorized",
      statusCode: HttpStatus.UNAUTHORIZED,
    },
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: "유저 또는 쿠폰 정보가 존재하지 않을 때",
    content: {
      "application/json": {
        examples: {
          userNotFound: {
            summary: "존재하지 않는 사용자",
            value: {
              statusCode: HttpStatus.NOT_FOUND,
              message: "not existed user",
              error: "Not Found",
            },
          },
          couponNotFound: {
            summary: "존재하지 않는 쿠폰",
            value: {
              statusCode: HttpStatus.NOT_FOUND,
              message: "not existed coupon",
              error: "Not Found",
            },
          },
        },
      },
    },
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: "잘못된 요청으로 인해서 발생하는 경우",
    content: {
      "application/json": {
        examples: {
          couponInactive: {
            summary: "비활성화된 쿠폰인 경우",
            value: {
              statusCode: HttpStatus.BAD_REQUEST,
              message: "coupon is not active.",
              error: "Bad Request",
            },
          },
          InvalidPeriodCoupon: {
            summary: "쿠폰의 사용기간이 벗어나는 경우",
            value: {
              statusCode: HttpStatus.BAD_REQUEST,
              message: "coupon is out of valid period.",
              error: "Bad Request",
            },
          },
          soldoutCoupon: {
            summary: "선착순 쿠폰에서 쿠폰의 수량이 모두 소진된 경우",
            value: {
              statusCode: HttpStatus.BAD_REQUEST,
              message: "sold out",
              error: "Bad Request",
            },
          },
          LimitedCoupon: {
            summary: "일반 쿠폰발급인데 쿠폰이 선착순 발급인 경우",
            value: {
              statusCode: HttpStatus.BAD_REQUEST,
              message: "coupon is limited",
              error: "Bad Request",
            },
          },
        },
      },
    },
  })
  @ApiConflictResponse({
    description: "이미 발급된 쿠폰인 경우(1인 1매 제한)",
    example: {
      statusCode: HttpStatus.CONFLICT,
      message: "Already issued",
      error: "Conflict",
    },
  })
  @ApiCreatedResponse({
    description: "쿠폰 발급 성공",
    example: {
      message: "success",
      statusCode: HttpStatus.CREATED,
    },
  })
  async createCouponIssueByUser(
    @Body() createCouponIssueByUserDto: CreateCouponIssueByUserDTO,
    @User() user: Payload,
  ): Promise<ResponseCommonSuccessDTO> {
    return await this.couponIssuedService.createCouponIssueByUser(
      createCouponIssueByUserDto,
      user,
    );
  }

  @Post("fcfs")
  @ApiBearerAuth("accessToken")
  @UseGuards(JwtAuthGuard)
  @ApiOperation({
    summary: "유저 선착순 쿠폰 발급",
    description: "유저에게 특정 쿠폰을 선착순으로 발급해줍니다.",
  })
  @ApiBody({
    description:
      "특정 쿠폰을 특정 유저에게 선착순으로 발급할때 사용되는 정보입니다.",
    required: true,
    type: CreateLimitCouponIssueByUserDTO,
  })
  @ApiUnauthorizedResponse({
    description: "로그인 하지 않은 경우",
    example: {
      message: "Unauthorized",
      statusCode: HttpStatus.UNAUTHORIZED,
    },
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: "유저 또는 쿠폰 정보가 존재하지 않을 때",
    content: {
      "application/json": {
        examples: {
          userNotFound: {
            summary: "존재하지 않는 사용자",
            value: {
              statusCode: HttpStatus.NOT_FOUND,
              message: "not existed user",
              error: "Not Found",
            },
          },
          couponNotFound: {
            summary: "존재하지 않는 쿠폰",
            value: {
              statusCode: HttpStatus.NOT_FOUND,
              message: "not existed coupon",
              error: "Not Found",
            },
          },
        },
      },
    },
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: "잘못된 요청으로 인해서 발생하는 경우",
    content: {
      "application/json": {
        examples: {
          couponInactive: {
            summary: "비활성화된 쿠폰인 경우",
            value: {
              statusCode: HttpStatus.BAD_REQUEST,
              message: "coupon is not active.",
              error: "Bad Request",
            },
          },
          InvalidPeriodCoupon: {
            summary: "쿠폰의 사용기간이 벗어나는 경우",
            value: {
              statusCode: HttpStatus.BAD_REQUEST,
              message: "coupon is out of valid period.",
              error: "Bad Request",
            },
          },
          soldoutCoupon: {
            summary: "선착순 쿠폰에서 쿠폰의 수량이 모두 소진된 경우",
            value: {
              statusCode: HttpStatus.BAD_REQUEST,
              message: "sold out",
              error: "Bad Request",
            },
          },
          notLimitedCoupon: {
            summary: "선착순 쿠폰발급인데 쿠폰이 발급제한이 없는 경우",
            value: {
              statusCode: HttpStatus.BAD_REQUEST,
              message: "coupon is not limited",
              error: "Bad Request",
            },
          },
        },
      },
    },
  })
  @ApiConflictResponse({
    description: "이미 발급된 쿠폰인 경우(1인 1매 제한)",
    example: {
      statusCode: HttpStatus.CONFLICT,
      message: "Already issued",
      error: "Conflict",
    },
  })
  @ApiCreatedResponse({
    description: "쿠폰 발급 성공",
    example: {
      message: "success",
      statusCode: HttpStatus.CREATED,
    },
  })
  async createLimitCouponIssueByUser(
    @Body() createLimitCouponIssueByUser: CreateLimitCouponIssueByUserDTO,
    @User() user: Payload,
  ): Promise<ResponseCommonSuccessDTO> {
    return await this.couponIssuedService.createLimitCouponIssueByUser(
      createLimitCouponIssueByUser,
      user,
    );
  }

  @Get("my")
  @ApiBearerAuth("accessToken")
  @UseGuards(JwtAuthGuard)
  @ApiOperation({
    summary: "내 발급 쿠폰 목록",
    description:
      "로그인한 사용자의 발급 쿠폰(발급 이력 + 쿠폰 정보)을 최신순으로 반환합니다.",
  })
  @ApiQuery({
    name: "page",
    required: false,
    example: 1,
    description: "페이지(기본 1)",
  })
  @ApiQuery({
    name: "limit",
    required: false,
    example: 10,
    description: "페이지 크기(기본 10)",
  })
  @ApiUnauthorizedResponse({
    description: "로그인하지 않은 경우",
    example: { message: "Unauthorized", statusCode: HttpStatus.UNAUTHORIZED },
  })
  @ApiOkResponse({
    description: "조회 성공",
    type: ResponseSuccessGetMyCouponListDTO,
  })
  async getMyCoupons(
    @User() user: Payload,
    @Query("page") page = 1,
    @Query("limit") limit = 10,
  ): Promise<ResponseSuccessGetMyCouponListDTO> {
    return this.couponIssuedService.getMyCoupons(
      user,
      Number(page),
      Number(limit),
    );
  }
}
