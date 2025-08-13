import { ApiProperty, OmitType } from "@nestjs/swagger";
import { ResponseCreateCouponDataDTO } from "./response-success-create-coupon.dto";

export class ResponseSuccessGetCouponListItemDTO extends OmitType(
  ResponseCreateCouponDataDTO,
  ["issuedUserId"],
) {
  @ApiProperty({ example: "2025-08-05T00:00:00.000Z" })
  createdDt: Date;

  @ApiProperty({ example: "2025-08-05T00:00:00.000Z" })
  updatedDt: Date;
}

export class ResponseSuccessGetCouponListDTO {
  @ApiProperty({ type: [ResponseSuccessGetCouponListItemDTO] })
  data: ResponseSuccessGetCouponListItemDTO[];

  @ApiProperty({ example: 100 })
  totalCount: number;

  @ApiProperty({ example: 1 })
  currPage: number;

  @ApiProperty({ example: 10 })
  totalPage: number;
}
