import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  Unique,
} from "typeorm";
import { PostEntity } from "./post.entity";

@Entity("post_like")
@Unique("post_like_unique_2", ["userId", "postId"])
export class PostLikeEntity {
  @PrimaryGeneratedColumn({
    type: "int",
    unsigned: true,
    name: "id",
    comment: "고유아이디",
  })
  id: number;

  @Column({
    type: "int",
    unsigned: true,
    name: "userId",
    nullable: false,
    comment: "user의 id",
  })
  userId: number;

  @Column({
    type: "int",
    unsigned: true,
    name: "postId",
    nullable: false,
    comment: "post의 id",
  })
  postId: number;

  @CreateDateColumn({
    type: "datetime",
    name: "createdDt",
    comment: "생성일",
    precision: 0,
    default: () => "CURRENT_TIMESTAMP(0)",
    nullable: false,
  })
  createdDt: Date;

  @Column({
    type: "datetime",
    name: "actionDt",
    comment: "마지막 좋아요 또는 좋아요 해지 일시",
    default: () => "CURRENT_TIMESTAMP(0)",
    precision: 0,
    nullable: true,
  })
  actionDt: Date;

  @ManyToOne(() => PostEntity, (post) => post.likes, {
    onDelete: "CASCADE",
  })
  @JoinColumn({ name: "postId", referencedColumnName: "id" })
  post: PostEntity;

  // /**
  //  * 사용자가 좋아요한 게시글들에 대한 정보는 확장된 설계로 진행하게되는 경우 추가설계 필요
  //  * 현시점에서는 게시글들에 대해 좋아요만 처리
  //  */
  // /** 유저와의 관계 (나중에 user.likes 안 쓸 거면 여기만 있어도 됨) */
  // @ManyToOne(() => UserEntity, (user) => user.postLikes, {
  //   onDelete: "CASCADE",
  // })
  // @JoinColumn({ name: "userId", referencedColumnName: "id" })
  // user: UserEntity;
}
