import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { PostEntity } from "entities/post.entity";
import { PostService } from "./post.service";
import { PostController } from "./post.controller";
import { UserService } from "src/user/user.service";
import { UserEntity } from "entities/user.entity";

@Module({
  imports: [TypeOrmModule.forFeature([PostEntity, UserEntity])],
  controllers: [PostController],
  providers: [PostService, UserService],
  exports: [TypeOrmModule],
})
export class PostModule {}
