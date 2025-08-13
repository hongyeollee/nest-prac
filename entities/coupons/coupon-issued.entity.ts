import { UserEntity } from "entities/user.entity";
import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from "typeorm";
import { CouponEntity } from "./coupon.entity";
import { Exclude } from "class-transformer";

@Entity("coupon_issued")
@Index(["userId", "couponId"], { unique: true }) // 쿠폰 발급시 필요한 인덱스 추가
export class CouponIssuedEntity {
  @PrimaryGeneratedColumn("increment", {
    name: "id",
    type: "int",
    unsigned: true,
    comment: "쿠폰 발행 고유 번호",
  })
  id: number;

  @Column({
    name: "userId",
    type: "int",
    unsigned: true,
    nullable: false,
    comment: "쿠폰 이용 사용자 정보",
  })
  userId: number;

  @Column({
    name: "couponId",
    type: "int",
    unsigned: true,
    nullable: false,
    comment: "쿠폰 고유 아이디",
  })
  couponId: number;

  @Column({
    name: "isUsed",
    type: "tinyint",
    default: false,
    nullable: false,
    comment: "쿠폰 사용 여부",
  })
  isUsed: boolean;

  @Column({
    name: "usedDt",
    type: "datetime",
    default: null,
    nullable: true,
    comment: "쿠폰 사용 일시",
  })
  usedDt: Date;

  @CreateDateColumn({
    name: "issuedDt",
    type: "datetime",
    nullable: false,
    comment: "쿠폰 발급정보 생성일시",
  })
  issuedDt: Date;

  @Column({
    name: "expiredDt",
    type: "datetime",
    default: null,
    nullable: true,
    comment: "쿠폰 유효기간 일시",
  })
  expiredDt: Date;

  //관계설정
  @Exclude()
  @ManyToOne(() => UserEntity, (user) => user.issuedCoupons)
  @JoinColumn({ name: "userId" })
  user: UserEntity;

  @Exclude()
  @ManyToOne(() => CouponEntity)
  @JoinColumn({ name: "couponId" })
  coupon: CouponEntity;
}
