import { Module } from "@nestjs/common";
import { FileUploadController } from "./file-upload.controller";
import { FileUploadService } from "./file-upload.service";
import { FileUploadUtil } from "./file-upload.util";

@Module({
  imports: [],
  controllers: [FileUploadController],
  providers: [FileUploadService, FileUploadUtil],
})
export class FileUploadModule {}
