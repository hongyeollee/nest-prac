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
    const redirectApp = express();
    redirectApp.use((req, res) => {
      res.redirect(`https://${req.headers.host}${req.url}`);
    });

    http.createServer(redirectApp).listen(80, () => {
      console.log(`📌 Http request will be redirect to Https (port 80 -> 443)`);
    });
  }
}
bootstrap();
