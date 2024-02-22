import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import * as cookieParser from 'cookie-parser';

async function bootstrap() {
  const port = 3000
  
  const app = await NestFactory.create(AppModule);

  app.use(cookieParser())
  
  await app.listen(port)
  console.log(`server listen on port ${port}🚀`)
}
// git revert 테스트를 위한 주석
bootstrap();
