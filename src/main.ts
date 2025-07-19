import { NestFactory } from "@nestjs/core";
import { AppModule } from "./app.module";
import * as cookieParser from "cookie-parser";
import { DocumentBuilder, SwaggerModule } from "@nestjs/swagger";
import { ValidationPipe } from "@nestjs/common";
import * as fs from "fs";
import * as express from "express";
import * as http from "http";

async function bootstrap() {
  const isProduction = process.env.NODE_ENV === "production";
  let app;

  if (isProduction) {
    const httpsOptions = {
      key: fs.readFileSync(
        "/etc/letsencrypt/live/record-useful.kro.kr/privkey.pem",
      ),
      cert: fs.readFileSync(
        "/etc/letsencrypt/live/record-useful.kro.kr/fullchain.pem",
      ),
    };

    app = await NestFactory.create(AppModule, {
      httpsOptions,
    });
  } else {
    app = await NestFactory.create(AppModule);
  }

  const port = isProduction ? process.env.PROD_PORT : process.env.DEV_PORT;

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
  console.log(`server listen on port ${port}🚀`);
  if (isProduction) {
    /**
     * ✅ http -> https redirect(애플리케이션 자체로)
     * http로 접근하는 경우를 대비하여
     * 운영서버에서 http로 접근시 https로 애플리케이션 자체에서 리다이렉트 시켜주는 코드 영역
     * ⚙️ 참고사항: 애플리케이션 범위에서 http->https 리다이렉트는 소규모, 개발테스트 영역단계에서 주로 사용됨
     *            (좀 더 큰 서버나 서비스 제공이 많은 플랫폼의 경우는 프록시나 클라우드에서 처리를 많이 하는 편)
     *            (ex. cloudflare, Nginx 등..)
     */
    const redirectApp = express();
    /**
     * express 애플리케이션을 실행하고 port 80번에서 실행될때 https로 리다이렉트 이동시켜줄 수 있도록 처리
     */
    redirectApp.use((req, res) => {
      const host = req.headers.host?.replace(/:\d+$/, "");
      res.redirect(`https://${host}${req.url}`);
    });

    http.createServer(redirectApp).listen(80);
  }
}
bootstrap();
