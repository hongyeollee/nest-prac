import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from "typeorm";
import { Post } from "./post.entity";
import { Exclude } from "class-transformer";

@Entity("user")
export class User {
  @Exclude()
  @PrimaryGeneratedColumn("increment", {
    name: "id",
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
  @OneToMany(() => Post, (post) => post.user)
  posts: Post[];
}
