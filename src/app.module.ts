import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from 'entities/user.entity';
import { Post } from 'entities/post.entity';
import { UserModule } from './user/user.module';
import { PostModule } from './post/post.module';
import { AuthMoudule } from './auth/auth.module';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'mysql',
      host: 'localhost',
      port: 3306,
      username: process.env.DB_USER_NAME || 'root',
      password: process.env.DB_PASSWORD || 'root',
      database: 'nest_prac',
      entities: [
        User,
        Post,
      ],
      synchronize: false,
      timezone: 'Z'
    }),

    //module
    UserModule,
    PostModule,
    AuthMoudule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
