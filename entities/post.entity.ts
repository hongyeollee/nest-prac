import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from "typeorm";
import { UserEntity } from "./user.entity";
import { Exclude } from "class-transformer";

@Entity("post")
export class PostEntity {
  @PrimaryGeneratedColumn({
    name: "id",
    comment: "게시판의 고유 번호",
  })
  id: number;

  @Exclude()
  @Column("varchar", {
    name: "userUuid",
    nullable: true,
    comment: "유저의 uuid 값",
  })
  userUuid: string;

  @Column("varchar", {
    name: "title",
    nullable: false,
    comment: "게시글의 제목",
  })
  title: string;

  @Column("longtext", {
    name: "content",
    nullable: true,
    comment: "게시글의 내용",
  })
  content: string;

  @CreateDateColumn({
    type: "datetime",
    precision: 0,
    name: "createdDt",
    default: () => "CURRENT_TIMESTAMP(0)",
    comment: "게시글 데이터 생성일",
  })
  createdDt: Date;

  @UpdateDateColumn({
    type: "datetime",
    precision: 0,
    name: "updatedDt",
    default: () => "CURRENT_TIMESTAMP(0)",
    onUpdate: "CURRENT_TIMESTAMP(0)",
    nullable: true,
    comment: "게시글 데이터 수정일",
  })
  updatedDt: Date | null;

  @DeleteDateColumn({
    type: "datetime",
    precision: 0,
    name: "deletedDt",
    default: null,
    nullable: true,
    comment: "게시글 데이터 삭제일",
  })
  deletedDt: Date | null;

  //관계설정
  @ManyToOne(() => UserEntity, (user) => user.posts, {
    onUpdate: "CASCADE",
    onDelete: "CASCADE",
  })
  @JoinColumn({ name: "userUuid", referencedColumnName: "userUuid" })
  user: UserEntity;
}
