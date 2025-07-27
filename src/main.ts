import { NestFactory } from "@nestjs/core";
import { AppModule } from "./app.module";
import * as cookieParser from "cookie-parser";
import { DocumentBuilder, SwaggerModule } from "@nestjs/swagger";
import { ConsoleLogger, ValidationPipe } from "@nestjs/common";
import * as fs from "fs";
import * as express from "express"; //순수 애플리케이션에서 http->https 리다이렉트시 사용
import * as http from "http"; //순수 애플리케이션에서 http->https 리다이렉트시 사용
import {
  currentENV,
  getCertKey,
  isDevelopment,
  isLocal,
  isProduction,
} from "./_config/config";

const logger = new ConsoleLogger("Application", { timestamp: true });

async function bootstrap() {
  /**
   * httpOptions 사용은 애플리케이션 자체에서 http-> https 사용하는 경우
   * Nginx에서 http 애플리케이션을 https로 변경해주고 http -> https로 리다이렉트해주기때문에 주석처리
   */
  // const httpsOptions = getCertKey();
  // const app = await NestFactory.create(AppModule, { httpsOptions });

  //다음해야할것 -> Nginx 설치 및 Nginx로 프록시 설정

  const app = await NestFactory.create(AppModule);

  const port = isProduction()
    ? process.env.PROD_PORT
    : isDevelopment()
      ? process.env.DEV_PORT
      : isLocal()
        ? process.env.LOCAL_PORT
        : 80;

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  const swaggerConfig = new DocumentBuilder()
    .setTitle("nest prac")
    .setDescription("나홀로 nest")
    .setVersion("1.0.0")
    .addTag("nest prac")
    .addBearerAuth(
      {
        type: "http",
        scheme: "bearer",
        bearerFormat: "JWT",
        name: "Authorization",
        in: "header",
      },
      "accessToken",
    )
    .build();

  const documentFactory = () =>
    SwaggerModule.createDocument(app, swaggerConfig);
  SwaggerModule.setup("api/docs", app, documentFactory);

  app.use(cookieParser());

  await app.listen(port, "0.0.0.0");
  logger.log(`Application Listening on port ${port}🚀. ENV: ${currentENV()}`);

  /**
   * Nginx 작동으로 인한 주석처리
   * Nginx 작동시 리버스프록시 역할로 NestJS 애플리케이션에서는 http만으로 작동해도 충분하며
   * Nginx에서 http -> https 리다이렉트 처리하도록 진행하게 되어 주석처리
   * 아래 내용들은 Nginx를 사용하지 않고 애플리케이션 자체로 http -> https 리다이렉트시에 사용
   */
  // if (isProduction) {
  //   /**
  //    * ✅ http -> https redirect(애플리케이션 자체로)
  //    * http로 접근하는 경우를 대비하여
  //    * 운영서버에서 http로 접근시 https로 애플리케이션 자체에서 리다이렉트 시켜주는 코드 영역
  //    * ⚙️ 참고사항: 애플리케이션 범위에서 http->https 리다이렉트는 소규모, 개발테스트 영역단계에서 주로 사용됨
  //    *            (좀 더 큰 서버나 서비스 제공이 많은 플랫폼의 경우는 프록시나 클라우드에서 처리를 많이 하는 편)
  //    *            (ex. cloudflare, Nginx 등..)
  //    */
  //   const redirectApp = express();
  //   /**
  //    * express 애플리케이션을 실행하고 port 80번에서 실행될때 https로 리다이렉트 이동시켜줄 수 있도록 처리
  //    */
  //   redirectApp.use((req, res) => {
  //     const host = req.headers.host?.replace(/:\d+$/, "");
  //     res.redirect(`https://${host}${req.url}`);
  //   });

  //   http.createServer(redirectApp).listen(80);
  // }
}
bootstrap();
