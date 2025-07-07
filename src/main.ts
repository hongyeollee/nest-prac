import { NestFactory } from "@nestjs/core";
import { AppModule } from "./app.module";
import * as cookieParser from "cookie-parser";
import { DocumentBuilder, SwaggerModule } from "@nestjs/swagger";

async function bootstrap() {
  const port = 3000;

  const app = await NestFactory.create(AppModule);
  const swaggerConfig = new DocumentBuilder()
    .setTitle("nest prac")
    .setDescription("나홀로 nest")
    .setVersion("1.0.0")
    .addTag("nest prac")
    .build();

  const documentFactory = () =>
    SwaggerModule.createDocument(app, swaggerConfig);
  SwaggerModule.setup("api/api-docs", app, documentFactory);

  app.use(cookieParser());

  await app.listen(port);
  console.log(`server listen on port ${port}🚀`);
}
bootstrap();
