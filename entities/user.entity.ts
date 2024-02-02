import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { Post } from "./post.entity";

@Entity('user')
export class User {
  @PrimaryGeneratedColumn({
    name: 'id',
    comment: '유저 고유아이디',
  })
  id: number

  @Column('varchar', {
    name: 'userUuid',
    unique: true,
    nullable: false,
    comment: '유저의  uuid',
  })
  userUuid:string

  @Column('varchar', {
    name: 'name',
    nullable: true,
    comment: '유저의 이름',
  })
  name: string

  @Column('varchar', {
    name: 'email',
    nullable: false,
    comment: '유저의 이메일주소',
  })
  email: string

  @Column('varchar', {
    name: 'password',
    nullable: false,
    comment: '유저의 비밀번호',
  })
  password: string

  @Column('datetime', {
    name: 'createdDt',
    default: () => 'CURRENT_TIMESTAMP',
    comment: '유저 데이터 생성일',
  })
  createdDt: Date

  @Column('datetime', {
    name: 'updatedDt',
    nullable: true,
    comment: '유저 데이터 수정일',
  })
  updatedDt: Date

  @Column('datetime', {
    name: 'deletedDt',
    nullable: true,
    comment: '유저 데이터 삭제일',
  })
  deletedDt: Date

  //관계설정
  @OneToMany(() => Post, post => post.userUuid)
  posts: Post[]
}