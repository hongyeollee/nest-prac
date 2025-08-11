import { HttpStatus } from "@nestjs/common";
import { ApiProperty } from "@nestjs/swagger";
import { ResponseCommonSuccessDTO } from "src/_common/_dto/common-success-response.dto";

export class ResponseCreateCouponDataDTO {
  @ApiProperty({ example: 1 })
  id: number;
  @ApiProperty({ example: "WELCOME2025" })
  code: string;
  @ApiProperty({ example: 3 })
  issuedUserId: number;
  @ApiProperty({ example: "웰컴 10% 쿠폰" })
  name: string;
  @ApiProperty({ example: "회원가입시 제공하는 쿠폰입니다." })
  description: string;
  @ApiProperty({ example: false })
  isActive: boolean;
  @ApiProperty({ example: "NONE" })
  discountType: string;
  @ApiProperty({ example: "10" })
  discountValue: string;
  @ApiProperty({ example: "5000.00" })
  minPrice: string;
  @ApiProperty({ example: false })
  isIssuedLimited: boolean;
  @ApiProperty({ example: null })
  totalCount: number;
  @ApiProperty({ example: 0 })
  issuedCount: number;
  @ApiProperty({ example: 0 })
  remainCount: number;
  @ApiProperty({ example: false })
  isPeriodLimited: boolean;
  @ApiProperty({ example: "2025-08-05T00:00:00.000Z" })
  startedDt: Date;
  @ApiProperty({ example: "2025-08-31T23:59:59.000Z" })
  endedDt: Date;
}

export class ResponseSuccessCreateCoupon extends ResponseCommonSuccessDTO {
  @ApiProperty({ example: HttpStatus.CREATED })
  statusCode: HttpStatus.CREATED;

  @ApiProperty({
    name: "data",
    type: ResponseCreateCouponDataDTO,
    description: "생성된 쿠폰 정보",
  })
  data: ResponseCreateCouponDataDTO;
}
