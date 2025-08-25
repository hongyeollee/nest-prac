// migration 용도 data-source.ts
import "dotenv/config";
import { DataSource } from "typeorm";
import { UserEntity } from "../../entities/user.entity";
import { PostEntity } from "../../entities/post.entity";
import { CouponEntity } from "../../entities/coupons/coupon.entity";
import { CouponIssuedEntity } from "../../entities/coupons/coupon-issued.entity";
import { CouponIssuedLogEntity } from "../../entities/coupons/coupon-issued-log.entity";

export const AppDataSource = new DataSource({
  type: "mysql",
  host: process.env.DB_HOST || "localhost",
  port: 3306,
  username: process.env.DB_USER_NAME || "root",
  password: process.env.DB_PASSWORD || "ghdfuf2",
  database: "nest_prac",
  timezone: "Z",
  synchronize: false,
  logging: true,
  entities: [
    UserEntity,
    PostEntity,
    CouponEntity,
    CouponIssuedEntity,
    CouponIssuedLogEntity,
  ],
  migrations: ["src/_migrations/*.ts"],
});
