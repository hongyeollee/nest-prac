import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from "typeorm";
import { PostEntity } from "./post.entity";
import { Exclude, Transform } from "class-transformer";
import { CouponIssuedEntity } from "./coupons/coupon-issued.entity";
import { CouponEntity } from "./coupons/coupon.entity";

@Entity("user")
export class UserEntity {
  @Exclude()
  @PrimaryGeneratedColumn("increment", {
    name: "id",
    unsigned: true,
    comment: "유저 고유아이디",
  })
  id: number;

  @Column("uuid", {
    name: "userUuid",
    unique: true,
    nullable: false,
    comment: "유저의  uuid",
  })
  userUuid: string;

  @Transform(({ value }) => value?.toUpperCase())
  @Column("varchar", {
    name: "userType",
    length: 255,
    nullable: false,
    default: "GENERAL",
    comment: `유저의 타입(ex. "ADMIN", "GENERAL")`,
  })
  userType: string = "GENERAL";

  @Column("varchar", {
    name: "name",
    length: 255,
    nullable: false,
    comment: "유저의 이름",
  })
  name: string;

  @Column("varchar", {
    name: "email",
    length: 255,
    unique: true,
    nullable: false,
    comment: "유저의 이메일주소",
  })
  email: string;

  @Exclude()
  @Column("varchar", {
    name: "password",
    length: 255,
    nullable: false,
    comment: "유저의 비밀번호",
  })
  password: string;

  @CreateDateColumn({
    name: "createdDt",
    nullable: false,
    comment: "유저 데이터 생성일",
  })
  createdDt: Date;

  @Exclude()
  @UpdateDateColumn({
    name: "updatedDt",
    nullable: true,
    comment: "유저 데이터 수정일",
  })
  updatedDt: Date;

  @Exclude()
  @DeleteDateColumn({
    name: "deletedDt",
    nullable: true,
    comment: "유저 데이터 삭제일",
  })
  deletedDt: Date;

  //관계설정
  @Exclude()
  @OneToMany(() => PostEntity, (postEntity) => postEntity.user)
  posts: PostEntity[];

  @Exclude()
  @OneToMany(() => CouponIssuedEntity, (couponIssued) => couponIssued.user)
  issuedCoupons: CouponIssuedEntity[];

  @Exclude()
  @OneToMany(() => CouponEntity, (coupon) => coupon.issuedUserId)
  coupons: CouponEntity[];
}
