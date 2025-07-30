import { Module } from "@nestjs/common";
import { AppController } from "./app.controller";
import { AppService } from "./app.service";
import { TypeOrmModule } from "@nestjs/typeorm";
import { User } from "entities/user.entity";
import { Post } from "entities/post.entity";
import { UserModule } from "./user/user.module";
import { PostModule } from "./post/post.module";
import { AuthMoudule } from "./auth/auth.module";
import { EmailModule } from "./mail/mail.module";
import { ConfigModule } from "@nestjs/config";
import { FileUploadModule } from "./file-upload/file-upload.module";
import { RedisCacheModule } from "./redis/redis.module";

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    TypeOrmModule.forRoot({
      type: "mysql",
      host: process.env.DB_HOST || "localhost",
      port: 3306,
      username: process.env.DB_USER_NAME || "root",
      password: process.env.DB_PASSWORD || "ghdfuf2", //"root",
      database: "nest_prac",
      entities: [User, Post],
      synchronize: false,
      /**
       * timezone에서 "Asia/Seoul"의 값은 지원하지 않음
       * 'local': 서버의 로컬시간대
       * 'Z': UT
       * '+09:00': UTC+9, 한국시간
       * [참고사항]: timezone은 typeorm에서 적용된만큼 typeorm 컬럼을 사용해야 DB에 적용받음
       * ex. @Column(), @CreateDateColumn() 등과 같이 사용된 경우.
       * [요약]
       * 동작방식: @UpdateDateColum(), @Colum({ type: 'datetime' }) 수동 설정 후 newDate()로 저장
       * => timezone 적용됨
       * 동작방식: dataSource.query('SELECT now()'), new Date()
       * => timezone 적용 안 됨
       */
      timezone: "Z",
      logging: false, //개발환경에서 유용하게 활용함.
      // logging: ['error', 'warn'] //운영 환경에서는 에러위주, 추가적으로 하면 경고까지도 하는 경우가 일반적인것 같음(chat GPT 내용 확인)
    }),

    //module
    UserModule,
    PostModule,
    AuthMoudule,
    EmailModule,
    FileUploadModule,
    RedisCacheModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
