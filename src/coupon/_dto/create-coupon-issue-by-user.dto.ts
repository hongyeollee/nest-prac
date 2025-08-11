import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, IsNumber } from "class-validator";

export class CreateCouponIssueByUserDTO {
  @IsNumber()
  @IsNotEmpty()
  @ApiProperty({
    title: "유저에게 줄 쿠폰의 고유번호",
    type: Number,
    name: "couponId",
    required: true,
    nullable: false,
    example: 1,
    description: "유저에게 줄 쿠폰의 고유번호",
  })
  couponId: number;
}
