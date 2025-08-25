import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
} from "typeorm";

@Entity("coupon_issued_log")
export class CouponIssuedLogEntity {
  @PrimaryGeneratedColumn("increment", {
    name: "id",
    type: "int",
    unsigned: true,
    comment: "쿠폰로그 고유 번호",
  })
  id: number;

  @Column({
    name: "userId",
    type: "int",
    nullable: false,
    comment: "쿠폰 이용 사용자 정보",
  })
  userId: number;

  @Column({
    name: "couponId",
    type: "int",
    nullable: false,
    comment: "쿠폰 고유 아이디",
  })
  couponId: number;

  @Column({
    name: "action",
    type: "varchar",
    length: 255,
    nullable: false,
    comment:
      "쿠폰 형태 정보(issued: 발행, used: 사용, cancelled: 사용취소, soldout: 쿠폰매진, already: 이미 발행됨)",
  })
  action: string;

  @CreateDateColumn({
    type: "datetime",
    precision: 0,
    name: "createdDt",
    nullable: false,
    comment: "쿠폰 로그 생성일시",
  })
  createdDt: Date;
}
