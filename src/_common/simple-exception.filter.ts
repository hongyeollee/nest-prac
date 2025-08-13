// src/filters/simple-exception.filter.ts
import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
  Logger,
} from "@nestjs/common";
import { HttpAdapterHost } from "@nestjs/core";

@Catch()
export class SimpleExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(SimpleExceptionFilter.name);

  constructor(private readonly httpAdapterHost: HttpAdapterHost) {}

  catch(exception: unknown, host: ArgumentsHost) {
    const { httpAdapter } = this.httpAdapterHost;
    const ctx = host.switchToHttp();
    const request = ctx.getRequest();

    const status =
      exception instanceof HttpException
        ? exception.getStatus()
        : HttpStatus.INTERNAL_SERVER_ERROR;

    const message =
      exception instanceof HttpException
        ? exception.message
        : "Internal server error";

    // 핵심: API 경로 + 메서드 + 상태코드 + 메시지만 로깅
    this.logger.error(
      `[${request.method}] ${request.url} -> ${status} (${message})`,
    );

    // 기본 Nest 응답 구조 유지
    const responseBody = {
      statusCode: status,
      message: message,
      timestamp: new Date().toISOString(),
      path: request.url,
    };

    httpAdapter.reply(ctx.getResponse(), responseBody, status);
  }
}
// import {
//   ArgumentsHost,
//   Catch,
//   ExceptionFilter,
//   HttpException,
//   HttpStatus,
//   Logger,
// } from "@nestjs/common";
// import { HttpAdapterHost } from "@nestjs/core";

// @Catch()
// export class SimpleExceptionFilter implements ExceptionFilter {
//   private readonly logger = new Logger(SimpleExceptionFilter.name);

//   constructor(private readonly httpAdapterHost: HttpAdapterHost) {}

//   catch(exception: unknown, host: ArgumentsHost) {
//     const { httpAdapter } = this.httpAdapterHost;
//     const ctx = host.switchToHttp();
//     const request = ctx.getRequest();

//     const status =
//       exception instanceof HttpException
//         ? exception.getStatus()
//         : HttpStatus.INTERNAL_SERVER_ERROR;

//     const message =
//       exception instanceof HttpException
//         ? exception.message
//         : "Internal server error";

//     this.logger.error(
//       `[${request.method}] ${request.url} -> ${status} ${message}`,
//     );

//     const responseBody = {
//       statusCode: status,
//       message,
//       timestamp: new Date().toISOString(),
//       path: request.url,
//     };

//     httpAdapter.reply(ctx.getResponse(), responseBody, status);
//   }
// }
