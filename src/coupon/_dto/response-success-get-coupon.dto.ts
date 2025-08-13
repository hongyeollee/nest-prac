import { ApiProperty } from "@nestjs/swagger";

export class ResponseSuccessGetCouponDTO {
  @ApiProperty({ example: 1 })
  id: number;

  @ApiProperty({ example: "WELCOME10" })
  code: string;

  @ApiProperty({ example: "10% 할인쿠폰" })
  name: string;

  @ApiProperty({ example: "회원가입 기념 10% 할인" })
  description: string;

  @ApiProperty({ example: true })
  isActive: boolean;

  @ApiProperty({ example: "PERCENT" })
  discountType: string;

  @ApiProperty({ example: "10" })
  discountValue: string;

  @ApiProperty({ example: "1000.00" })
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

  @ApiProperty({ example: "2025-08-01T00:00:00Z" })
  startedDt: Date;

  @ApiProperty({ example: "2025-08-31T23:59:59Z" })
  endedDt: Date;

  @ApiProperty({ example: "2025-08-01T00:00:00Z" })
  createdDt: Date;

  @ApiProperty({ example: "2025-08-01T00:00:00Z" })
  updatedDt: Date;
}
