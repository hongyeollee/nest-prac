import { BadRequestException, Body, Controller, Post, UploadedFile, UploadedFiles, UseInterceptors } from "@nestjs/common";
import { FileUploadService } from "./file-upload.service";
import { FileFieldsInterceptor, FileInterceptor } from "@nestjs/platform-express";
import { FileSizeValidationPipe } from "./file-upload.util";

@Controller('file-upload')
export class FileUploadController {
  constructor (private readonly fileUploadService: FileUploadService) {}

  private readonly notAllowFileMimetype: string[] = []

  @Post('singular') //단일 파일 업로드
  @UseInterceptors(FileInterceptor('file'))
  async fileUploadsingluar(
    @UploadedFile(
      new FileSizeValidationPipe()
    ) file: Express.Multer.File,
    @Body() body: any,
  ) {
    if(this.notAllowFileMimetype.includes(file.mimetype)) {
      throw new BadRequestException('can not access mimetype')
    }

    return await this.fileUploadService.fileUploadsingluar(file, body)
  }

  @Post('plural') //복수 파일 업로드
  @UseInterceptors(FileFieldsInterceptor([{name: 'files', maxCount: 5}],{limits: {fileSize: 20 * 1024 * 1024}}))
  async fileUploadPlural(
    @UploadedFiles() files: Express.Multer.File[],
    @Body() body: []
  ) {
    return await this.fileUploadService.fileUploadPlural(files, body)
  }
}