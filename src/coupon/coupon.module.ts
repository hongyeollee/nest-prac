import { Module } from "@nestjs/common";
import { AdminCouponContorller } from "./admin-coupon.controller";
import { CouponService } from "./coupon.service";
import { TypeOrmModule } from "@nestjs/typeorm";
import { CouponEntity } from "entities/coupons/coupon.entity";
import { CouponIssuedEntity } from "entities/coupons/coupon-issued.entity";
import { CouponIssuedLogEntity } from "entities/coupons/coupon-issued-log.entity";
import { CouponIssuedController } from "./coupon-issued/coupon-issued.controller";
import { CouponIssuedService } from "./coupon-issued/coupon-issued.service";
import { UserModule } from "src/user/user.module";

@Module({
  imports: [
    TypeOrmModule.forFeature([
      CouponEntity,
      CouponIssuedEntity,
      CouponIssuedLogEntity,
    ]),
    UserModule,
  ],
  controllers: [AdminCouponContorller, CouponIssuedController],
  providers: [CouponService, CouponIssuedService],
})
export class CouponModule {}
