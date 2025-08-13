import { PartialType } from "@nestjs/swagger";
import { CreateCouponDTO } from "./create-coupon.dto";

export class UpdateCouponDTO extends PartialType(CreateCouponDTO) {}
