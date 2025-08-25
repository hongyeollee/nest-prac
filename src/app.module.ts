import { Module } from "@nestjs/common";
import { AppController } from "./app.controller";
import { AppService } from "./app.service";
import { TypeOrmModule } from "@nestjs/typeorm";
import { UserEntity } from "entities/user.entity";
import { PostEntity } from "entities/post.entity";
import { UserModule } from "./user/user.module";
import { PostModule } from "./post/post.module";
import { AuthMoudule } from "./auth/auth.module";
import { EmailModule } from "./mail/mail.module";
import { ConfigModule } from "@nestjs/config";
import { FileUploadModule } from "./file-upload/file-upload.module";
import { RedisCacheModule } from "./redis/redis.module";
import { CouponEntity } from "entities/coupons/coupon.entity";
import { CouponIssuedEntity } from "entities/coupons/coupon-issued.entity";
import { CouponIssuedLogEntity } from "entities/coupons/coupon-issued-log.entity";
import { CommonModule } from "./_common/common.module";
import { CouponModule } from "./coupon/coupon.module";

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
      password: process.env.DB_PASSWORD || "ghdfuf2",
      database: "nest_prac",
      entities: [
        UserEntity,
        PostEntity,
        CouponEntity,
        CouponIssuedEntity,
        CouponIssuedLogEntity,
      ],
      synchronize: process.env.NODE_ENV === "production" ? false : false, // 개발초기에는 true로 사용해도 도지만, 마이그레이션을 쓰기 시작하면 false로 전환하여 사용해야함.
      /*
       * timezone에서 "Asia/Seoul"의 값은 지원하지 않음
       * 'local': 서버의 로컬시간대
       * 'Z': UT
       * '+09:00': UTC+9, 한국시간
       * [참고사항]: timezone은 typeorm에서 적용된만큼 typeorm 컬럼을 사용해야 DB에 적용받음
       * ex. @Column(), @CreateDateColumn() 등과 같이 사용된 경우.
       * [요약]
       * 동작방식: @UpdateDateColum(), @Colum({ type: 'datetime' }) 수동 설정 후 newDate()로 저장
       *      * 참고: typeorm에서 "datetime" 사용하는 경우에 ms(millisecond)까지 표현하려면 precision값 설정하지 않거나 설정시 원하는 값 표기
       *               => second까지만 표현하려면 precision: 0으로 명시하여 설정처리
       * => timezone 적용됨
       * 동작방식: dataSource.query('SELECT now()'), new Date()
       * => timezone 적용 안 됨
       * 해당 영역에서는 NestJS의 애플리케이션 작동만 신경쓰는 영역이기때문에 migration에 대한 정보가 필요없음. /_config/data-source.ts에서 migration cli에 대한 정보 담당.
       */
      timezone: "Z",
      logging: true, //개발환경에서 유용하게 활용함.
      // logging: ['error', 'warn'] //운영 환경에서는 에러위주, 추가적으로 하면 경고까지도 하는 경우가 일반적인것 같음(chat GPT 내용 확인)
    }),

    //module
    UserModule,
    PostModule,
    AuthMoudule,
    EmailModule,
    FileUploadModule,
    RedisCacheModule,
    CommonModule,
    CouponModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
