import {
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
import { CouponService } from "./coupon.service";
import {
  ApiBearerAuth,
  ApiBody,
  ApiConflictResponse,
  ApiCreatedResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiTags,
  ApiUnauthorizedResponse,
} from "@nestjs/swagger";
import { JwtAuthGuard } from "src/auth/security/auth.guard";
import { CreateCouponDTO } from "./_dto/create-coupon.dto";
import {
  ResponseCreateCouponDataDTO,
  ResponseSuccessCreateCoupon,
} from "./_dto/response-success-create-coupon.dto";
import { User } from "src/auth/user.decorator";
import { Payload } from "src/auth/security/user.payload.interface";
import { instanceToPlain } from "class-transformer";
import { ResponseCommonSuccessDTO } from "src/_common/_dto/common-success-response.dto";
import { UpdateCouponDTO } from "./_dto/update-coupon.dto";
import { ResponseSuccessGetCouponListDTO } from "./_dto/response-success-get-coupon-list.dto";
import { ResponseSuccessGetCouponDTO } from "./_dto/response-success-get-coupon.dto";
import { Roles } from "src/auth/decorator/roles.decorator";
import { RolesGuard } from "src/auth/security/role.guard";

@Controller("admin/coupon")
@ApiTags("어드민 쿠폰 관리(admin/coupon)")
export class AdminCouponContorller {
  constructor(private readonly couponService: CouponService) {}

  @Post()
  @ApiBearerAuth("accessToken")
  @Roles("ADMIN")
  @UseGuards(JwtAuthGuard, RolesGuard)
  @ApiOperation({
    summary: "쿠폰 생성",
    description: `
      쿠폰을 생성합니다.
      - 쿠폰 코드는 클라이언트에서 별도로 설정된 값이 아니면 문자 + 숫자 조합의 7개 문자열로 코드가 자동생성됩니다.
    `,
  })
  @ApiBody({
    type: CreateCouponDTO,
    description: "쿠폰 생성 필요 정보",
  })
  @ApiUnauthorizedResponse({
    description: "로그인 하지 않은 경우",
    example: {
      message: "Unauthorized",
      statusCode: HttpStatus.UNAUTHORIZED,
    },
  })
  @ApiConflictResponse({
    description: "이미 존재하는 쿠폰 코드 입력시",
    example: {
      message: "already exist coupon code",
      error: "Conflict",
      statusCode: HttpStatus.CONFLICT,
    },
  })
  @ApiCreatedResponse({
    description: "쿠폰 생성 성공",
    type: ResponseSuccessCreateCoupon,
  })
  async createCoupon(
    @Body() createCouponDto: CreateCouponDTO,
    @User() user: Payload,
  ): Promise<ResponseSuccessCreateCoupon> {
    const couponData = await this.couponService.createCoupon(
      createCouponDto,
      user,
    );
    return {
      message: "success",
      statusCode: HttpStatus.CREATED,
      data: instanceToPlain(couponData) as ResponseCreateCouponDataDTO,
    };
  }

  @Delete(":id")
  @ApiBearerAuth("accessToken")
  @Roles("ADMIN")
  @UseGuards(JwtAuthGuard, RolesGuard)
  @ApiOperation({
    summary: "쿠폰 삭제",
    description: "쿠폰을 삭제합니다.",
  })
  @ApiUnauthorizedResponse({
    description: "로그인 하지 않은 경우",
    example: {
      message: "Unauthorized",
      statusCode: HttpStatus.UNAUTHORIZED,
    },
  })
  @ApiNotFoundResponse({
    description: "존재하지 않는 쿠폰 정보일때",
    example: {
      message: "not eixst coupon info",
      error: "Not Found",
      statusCode: HttpStatus.NOT_FOUND,
    },
  })
  @ApiOkResponse({
    description: "쿠폰정보 삭제 성공",
    type: ResponseCommonSuccessDTO,
  })
  async deleteCoupon(
    @Param("id") id: number,
  ): Promise<ResponseCommonSuccessDTO> {
    return await this.couponService.deleteCoupon(id);
  }

  @Put(":id")
  @ApiBearerAuth("accessToken")
  @Roles("ADMIN")
  @UseGuards(JwtAuthGuard, RolesGuard)
  @ApiOperation({
    summary: "쿠폰 정보 수정",
    description: "쿠폰의 정보를 수정합니다.",
  })
  @ApiParam({
    name: "id",
    required: true,
    description: "조회할 쿠폰의 ID",
    example: 1,
  })
  @ApiBody({
    type: UpdateCouponDTO,
    description: "수정할 쿠폰 정보",
  })
  @ApiUnauthorizedResponse({
    description: "로그인 하지 않은 경우",
    example: {
      message: "Unauthorized",
      statusCode: HttpStatus.UNAUTHORIZED,
    },
  })
  @ApiConflictResponse({
    description: "이미 존재하는 쿠폰 코드 입력시",
    example: {
      message: "already existed coupon code",
      error: "Conflict",
      statusCode: HttpStatus.CONFLICT,
    },
  })
  @ApiNotFoundResponse({
    description: "존재하지 않는 쿠폰 정보일때",
    example: {
      message: "not eixst coupon info",
      error: "Not Found",
      statusCode: HttpStatus.NOT_FOUND,
    },
  })
  @ApiOkResponse({
    description: "쿠폰정보 수정 성공",
    type: ResponseCommonSuccessDTO,
  })
  async updateCoupon(
    @Param("id") id: number,
    @Body() updateCouponDto: UpdateCouponDTO,
  ): Promise<ResponseCommonSuccessDTO> {
    return await this.couponService.updateCoupon(id, updateCouponDto);
  }

  @Get(":id")
  @ApiBearerAuth("accessToken")
  @Roles("ADMIN")
  @UseGuards(JwtAuthGuard, RolesGuard)
  @ApiOperation({
    summary: "쿠폰 단건 조회",
    description: "쿠폰 단건 정보를 조회합니다.",
  })
  @ApiParam({
    name: "id",
    required: true,
    description: "조회할 쿠폰의 ID",
    example: 1,
  })
  @ApiNotFoundResponse({
    description: "존재하지 않는 쿠폰 정보일때",
    example: {
      message: "not eixst coupon info",
      error: "Not Found",
      statusCode: HttpStatus.NOT_FOUND,
    },
  })
  @ApiOkResponse({
    description: "쿠폰 단건 조회 성공",
    type: ResponseSuccessGetCouponDTO,
  })
  async getCoupon(
    @Param("id") id: number,
  ): Promise<ResponseSuccessGetCouponDTO> {
    return await this.couponService.getCoupon(id);
  }

  @Get()
  @ApiBearerAuth("accessToken")
  @Roles("ADMIN")
  @UseGuards(JwtAuthGuard, RolesGuard)
  @ApiOperation({
    summary: "쿠폰 목록 조회",
    description: "쿠폰 목록을 페이지네이션 방식으로 조회합니다.",
  })
  @ApiQuery({
    name: "page",
    required: false,
    type: Number,
    example: 1,
    description: "조회할 페이지 번호 (기본값: 1)",
  })
  @ApiQuery({
    name: "limit",
    required: false,
    type: Number,
    example: 10,
    description: "페이지당 항목 수 (기본값: 10)",
  })
  @ApiQuery({
    name: "orderBy",
    required: false,
    enum: ["ASC", "DESC"],
    example: "DESC",
    description: "정렬 순서 (기본값: DESC)",
  })
  @ApiOkResponse({
    description: "쿠폰 목록 조회 성공",
    type: ResponseSuccessGetCouponListDTO,
  })
  async getCouponList(
    @Query("page") page: number = 1,
    @Query("limit") limit: number = 10,
    @Query("orderBy") orderBy: "DESC" | "ASC" = "DESC",
  ): Promise<ResponseSuccessGetCouponListDTO> {
    return await this.couponService.getCouponList(page, limit, orderBy);
  }
}
