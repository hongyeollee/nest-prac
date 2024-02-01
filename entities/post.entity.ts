import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { User } from "./user.entity";

@Entity()
export class Post {
  @PrimaryGeneratedColumn({
    name: 'id',
    comment: '게시판의 고유 번호',
  })
  id: number

  @Column('varchar', {
    name: 'userUuid',
    nullable: true,
    comment: '유저의 uuid 값',
  })
  userUuid: string

  @Column('varchar', {
    name: 'title',
    nullable: false,
    comment: '게시글의 제목',
  })
  title: string

  @Column('longtext', {
    name: 'content',
    nullable: true,
    comment: '게시글의 내용'
  })
  content: string

  @Column('datetime', {
    name: 'createdDt',
    default: () => 'CURRENT_TIMESTAMP',
    comment: '게시글 데이터 생성일',
  })
  createdDt: Date

  //관계설정
  @ManyToOne(() => User, user => user.posts,
  { onUpdate: 'CASCADE', onDelete: 'CASCADE' })
  @JoinColumn({name: 'userUuid'})
  user: User
}