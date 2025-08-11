import { ApiProperty } from "@nestjs/swagger";

export class MyCouponItemDTO {
  @ApiProperty({ example: 12 })
  issuedId: number;

  @ApiProperty({ example: false })
  isUsed: boolean;

  @ApiProperty({ example: "2025-08-01T00:00:00.000Z", nullable: true })
  expiredDt: string | null;

  // coupon fields (원하는 필드만 노출)
  @ApiProperty({ example: 1 })
  couponId: number;

  @ApiProperty({ example: "WELCOME10" })
  code: string;

  @ApiProperty({ example: "10% 웰컴 쿠폰" })
  name: string;

  @ApiProperty({ example: "PERCENT" })
  discountType: string;

  @ApiProperty({ example: "10.00", nullable: true })
  discountValue: string | null;

  @ApiProperty({ example: "10000.00", nullable: true })
  minPrice: string | null;

  @ApiProperty({ example: true })
  isActive: boolean;

  @ApiProperty({ example: "2025-08-01T00:00:00.000Z", nullable: true })
  startedDt: string | null;

  @ApiProperty({ example: "2025-08-01T00:00:00.000Z", nullable: true })
  endedDt: string | null;
}

export class ResponseSuccessGetMyCouponListDTO {
  @ApiProperty({ type: [MyCouponItemDTO] })
  coupons: MyCouponItemDTO[];

  @ApiProperty({ example: 42 })
  totalCount: number;

  @ApiProperty({ example: 1 })
  currPage: number;

  @ApiProperty({ example: 5 })
  totalPage: number;
}
