import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from "typeorm";
import { CouponIssuedEntity } from "./coupon-issued.entity";
import { Exclude } from "class-transformer";
import { UserEntity } from "entities/user.entity";

@Entity("coupon")
export class CouponEntity {
  @PrimaryGeneratedColumn("increment", {
    name: "id",
    type: "int",
    unsigned: true,
    comment: "쿠폰 고유 번호",
  })
  id: number;

  @Column({
    name: "code",
    unique: true,
    type: "varchar",
    length: 255,
    nullable: false,
    comment: "쿠폰 코드",
  })
  code: string;

  @Column({
    name: "issuedUserId",
    type: "int",
    unsigned: true,
    nullable: false,
    comment: "쿠폰 생성 유저 고유값",
  })
  issuedUserId: number;

  @Column({
    name: "name",
    type: "varchar",
    length: 255,
    nullable: false,
    comment: "쿠폰 이름",
  })
  name: string;

  @Column({
    name: "description",
    type: "text",
    nullable: true,
    comment: "쿠폰 부가설명",
  })
  description: string;

  @Column({
    name: "isActive",
    type: "tinyint",
    default: false,
    nullable: false,
    comment: "쿠폰 사용가능 여부",
  })
  isActive: boolean;

  @Column({
    /**
     * discountType이 기획적으로 명확해지는 경우
     * enum type으로 작업하는것이 더 명확해짐.
     */
    name: "discountType",
    type: "varchar",
    length: 255,
    default: "NONE",
    nullable: false,
    comment: "쿠폰 할인 유형(PERCENT(%할인), AMOUNT(금액할인), NONE(할인없음))",
  })
  discountType: string;

  @Column({
    name: "discountValue",
    type: "decimal",
    precision: 10,
    scale: 2,
    nullable: true,
    comment: "쿠폰 할인 값",
  })
  discountValue: string;

  @Column({
    name: "minPrice",
    type: "decimal",
    precision: 10,
    scale: 2,
    nullable: true,
    comment: "최소 주문금액",
  })
  minPrice: string;

  @Column({
    name: "isIssuedLimited",
    type: "tinyint",
    default: false,
    comment: "쿠폰 발행 개수 제한 여부",
  })
  isIssuedLimited: boolean;

  @Column({
    name: "totalCount",
    type: "int",
    default: null,
    nullable: true,
    comment: "발행 가능 총 개수(null = 무제한)",
  })
  totalCount: number;

  @Column({
    name: "issuedCount",
    type: "int",
    default: 0,
    nullable: true,
    comment: "발행된 수량",
  })
  issuedCount: number;

  @Column({
    name: "remainCount",
    type: "int",
    nullable: true,
    comment: "발행제한 쿠폰시 쿠폰의 제한 잔여 개수",
  })
  remainCount: number;

  @Column({
    name: "isPeriodLimited",
    type: "tinyint",
    default: false,
    nullable: false,
    comment: "쿠폰 유효기간 여부",
  })
  isPeriodLimited: boolean;

  @Column({
    name: "startedDt",
    type: "datetime",
    precision: 0,
    default: null,
    nullable: true,
    comment: "쿠폰 유효기간 적용시 쿠폰 사용가능 시작일시",
  })
  startedDt: Date;

  @Column({
    name: "endedDt",
    type: "datetime",
    precision: 0,
    default: null,
    nullable: true,
    comment: "쿠폰 유효기간 적용시 쿠폰 사용종료 기한일시",
  })
  endedDt: Date;

  @Exclude()
  @CreateDateColumn({
    name: "createdDt",
    type: "datetime",
    precision: 0,
    nullable: false,
    comment: "쿠폰 정보 생성일시",
  })
  createdDt: Date;

  @Exclude()
  @UpdateDateColumn({
    name: "updatedDt",
    type: "datetime",
    precision: 0,
    nullable: true,
    comment: "쿠폰 정보 수정일시",
  })
  updatedDt: Date;

  @Exclude()
  @DeleteDateColumn({
    name: "deletedDt",
    type: "datetime",
    precision: 0,
    nullable: true,
    comment: "쿠폰 정보 삭제일시",
  })
  deletedDt: Date;

  //관계 정보
  @Exclude()
  @OneToMany(() => CouponIssuedEntity, (couponIssued) => couponIssued.coupon)
  issuedCoupons: CouponIssuedEntity[];

  @Exclude()
  @ManyToOne(() => UserEntity, (user) => user.coupons)
  @JoinColumn({ name: "issuedUserId" })
  user: UserEntity;
}
