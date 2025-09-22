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
export class UnifiedExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(UnifiedExceptionFilter.name);

  constructor(private readonly httpAdapterHost: HttpAdapterHost) {}

  catch(exception: unknown, host: ArgumentsHost) {
    const { httpAdapter } = this.httpAdapterHost;
    const ctx = host.switchToHttp();
    const request = ctx.getRequest();

    const isHttp = exception instanceof HttpException;
    const status = isHttp
      ? exception.getStatus()
      : HttpStatus.INTERNAL_SERVER_ERROR;
    const statusText = HttpStatus[status] || "unknown status";
    const message = isHttp
      ? (exception as HttpException).message
      : "Internal server error";

    // 핵심: API 경로 + 메서드 + 상태코드[상태코드텍스트] + 메시지만 로깅
    // 로깅 소음비용을 구분하여 절약(warn, error, log 나눠서 구분)
    if (status === 404 || status === 405) {
      this.logger.warn(
        `${request.method} ${request.originalUrl || request.url} -> ${status}`,
      );
    } else if (status >= 500) {
      this.logger.error(
        `${request.method} ${request.originalUrl || request.url} -> ${status}: ${(exception as any)?.message ?? "Unknown error"}`,
      );
    } else {
      this.logger.log(
        `${request.method} ${request.originalUrl || request.url} -> ${status}`,
      );
    }

    // 기본 Nest 응답 구조 유지
    const responseBody = {
      statusCode: status,
      statusText,
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
