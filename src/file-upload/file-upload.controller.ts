import {
  BadRequestException,
  Body,
  Controller,
  HttpStatus,
  Post,
  UploadedFile,
  UploadedFiles,
  UseInterceptors,
} from "@nestjs/common";
import { FileUploadService } from "./file-upload.service";
import {
  FileFieldsInterceptor,
  FileInterceptor,
} from "@nestjs/platform-express";
import { FileSizeValidationPipe } from "./file-upload.util";
import {
  ApiBadRequestResponse,
  ApiBody,
  ApiConsumes,
  ApiInternalServerErrorResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from "@nestjs/swagger";
import {
  ResponseSuccessFilesUploadDTO,
  ResponseSuccessFileUploadDTO,
} from "./_dto/response.success-file-upload.dto";

@Controller("file-upload")
@ApiTags("file-uploads")
export class FileUploadController {
  constructor(private readonly fileUploadService: FileUploadService) {}

  private readonly notAllowFileMimetype: string[] = [];

  @Post("single")
  @ApiOperation({
    summary: "단일 파일 업로드",
    description: "파일 하나만 업로드 합니다.",
  })
  @UseInterceptors(FileInterceptor("file"))
  @ApiConsumes("multipart/form-data")
  @ApiBody({
    description: "업로드할 파일과 subdir 필드",
    required: true,
    schema: {
      type: "object",
      properties: {
        file: {
          type: "string",
          format: "binary",
        },
        subdir: {
          type: "string",
          example: "profile",
        },
      },
      required: ["file", "subdir"],
    },
  })
  @ApiNotFoundResponse({
    description: "파일이 없는 경우",
    example: {
      statusCode: HttpStatus.NOT_FOUND,
      message: "not exist file",
      error: "Not Found",
    },
  })
  @ApiBadRequestResponse({
    description: "지원하지 않는 파일 확장자 업로드시",
    example: {
      statusCode: HttpStatus.BAD_REQUEST,
      message: "can not access mimetype",
      error: "Bad Request",
    },
  })
  @ApiInternalServerErrorResponse({
    description: "파일 업로드 실패",
    example: {
      statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
      message: "fail file upload",
      error: "Internal Server Error",
    },
  })
  @ApiOkResponse({
    description: "단일 파일 업로드 성공",
    type: ResponseSuccessFileUploadDTO,
  })
  async singleUpload(
    @UploadedFile(new FileSizeValidationPipe()) file: Express.Multer.File,
    @Body("subdir") subdir: string,
  ): Promise<ResponseSuccessFileUploadDTO> {
    if (this.notAllowFileMimetype.includes(file.mimetype)) {
      throw new BadRequestException("can not access mimetype");
    }

    const result = await this.fileUploadService.singleUpload(file, subdir);

    return {
      message: "success",
      statusCode: HttpStatus.OK,
      data: result,
    };
  }

  @Post("multiple")
  @ApiOperation({
    summary: "다중 파일 업로드",
    description: "여러개의 파일을 업로드 합니다.",
  })
  @UseInterceptors(
    FileFieldsInterceptor([{ name: "files", maxCount: 5 }], {
      limits: { fileSize: 20 * 1024 * 1024 },
    }),
  )
  @ApiConsumes("multipart/form-data")
  @ApiBody({
    description: "업로드할 파일과 subdir 필드",
    required: true,
    schema: {
      type: "object",
      properties: {
        files: {
          type: "array",
          items: {
            type: "string",
            format: "binary",
          },
        },
        subdir: {
          type: "string",
          example: "profile",
        },
      },
      required: ["files", "subdir"],
    },
  })
  @ApiNotFoundResponse({
    description: "파일이 없는 경우",
    example: {
      statusCode: HttpStatus.NOT_FOUND,
      message: "not exist file",
      error: "Not Found",
    },
  })
  @ApiBadRequestResponse({
    description: "지원하지 않는 파일 확장자 업로드시",
    example: {
      statusCode: HttpStatus.BAD_REQUEST,
      message: "can not access mimetype",
      error: "Bad Request",
    },
  })
  @ApiInternalServerErrorResponse({
    description: "파일 업로드 실패",
    example: {
      statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
      message: "fail files upload",
      error: "Internal Server Error",
    },
  })
  @ApiOkResponse({
    description: "다중 파일 업로드 성공",
    type: ResponseSuccessFilesUploadDTO,
  })
  async multiUpload(
    @UploadedFiles() files: { files: Express.Multer.File[] },
    @Body("subdir") subdir: string,
  ): Promise<ResponseSuccessFilesUploadDTO> {
    const fileArr = files.files;
    const hasNotAllowed = fileArr.some((file) =>
      this.notAllowFileMimetype.includes(file.mimetype),
    );

    if (hasNotAllowed) {
      throw new BadRequestException("can not access mimetype");
    }
    const results = await this.fileUploadService.multipleUpload(
      fileArr,
      subdir,
    );

    return {
      message: "success",
      statusCode: HttpStatus.OK,
      data: results,
    };
  }
}
