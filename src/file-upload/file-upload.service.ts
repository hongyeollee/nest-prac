import {
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from "@nestjs/common";
import { FileUploadUtil } from "./file-upload.util";

@Injectable()
export class FileUploadService {
  constructor(private readonly fileUploadUtil: FileUploadUtil) {}
  async singleUpload(
    file: Express.Multer.File,
    subdir: string,
  ): Promise<{
    url: string;
    name: string;
    key: string;
  }> {
    if (!file) {
      throw new NotFoundException("not exist file");
    }
    try {
      const key = this.fileUploadUtil.generateFileKey(
        this.fileUploadUtil.safeName(file.originalname),
        subdir,
      );
      await this.fileUploadUtil.uploadS3(file.buffer, file.mimetype, key);

      return {
        url: this.fileUploadUtil.getFileUrl(key),
        name: this.fileUploadUtil.safeName(file.originalname),
        key,
      };
    } catch (error) {
      console.error(error);
      throw new InternalServerErrorException("fail file upload");
    }
  }

  async multipleUpload(
    files: Express.Multer.File[],
    subdir: string,
  ): Promise<
    {
      url: string;
      name: string;
      key: string;
    }[]
  > {
    const uploadedKeys: string[] = [];

    if (!files || files.length === 0) {
      throw new NotFoundException("not exist file");
    }
    try {
      const results = await Promise.all(
        files.map(async (file) => {
          const result = await this.singleUpload(file, subdir);
          uploadedKeys.push(result.key);
          return result;
        }),
      );
      return results;
    } catch (error) {
      console.error(error);
      await Promise.all(
        uploadedKeys.map((key) => this.fileUploadUtil.deleteFromS3(key)),
      );
      throw new InternalServerErrorException("fail files upload");
    }

    /**
     * 다중 업로드에서 성공/실패 영역 나뉘어 처리할 경우
     */
    /* 
    const successes = results
      .filter((r) => r.status === "fulfilled")
      .map((r) => (r as PromiseFulfilledResult<any>).value);

    const failures = results
      .filter((r) => r.status === "rejected")
      .map((r, idx) => ({
        index: idx,
        reason: (r as PromiseRejectedResult).reason,
      }));

    return { successes, failures };

    // 예시 리턴값
    // {
    //   successes: [
    //     { url, name, key },
    //     { url, name, key },
    //   ],
    //   failures: [
    //     { index: 2, reason: Error('AccessDenied') }
    //   ]
    // }
    */
  }

  /**
   * regacy
   */
  // async fileUploadsingle(file: Express.Multer.File, subdir: string) {
  //   const dataBuffuer = file?.buffer;
  //   if (!dataBuffuer) {
  //     throw new NotFoundException("file not found");
  //   }

  //   const ext = extname(file.originalname).replace(".", "");
  //   const uploadName = this.generateFileName(subdir, ext);

  //   return this.getLocation(uploadName);
  // }

  /**
   * regacy
   */
  // private getLocation(info: string) {
  //   // return `https://${this.AWS_S3_BUCKET}.s3.${this.configService.get('AWS_REGION')}.amazonaws.com/${key}`
  //   return `https://${"ㅇㅇㅇ"}.s3.~~~.amazonaws.com/${info}`;
  // }

  /**
   * regacy
   */
  // private generateFileName(subdir: string, ext: string, index?: number) {
  //   const date = new Date();
  //   const year = String(date.getFullYear()).padStart(2, "0");
  //   const month = String(date.getMonth() + 1).padStart(2, "0");
  //   const day = String(date.getDate()).padStart(2, "0");
  //   const hours = String(date.getHours()).padStart(2, "0");
  //   const minutes = String(date.getMinutes()).padStart(2, "0");
  //   const seconds = String(date.getSeconds()).padStart(2, "0");
  //   const milliseconds = String(date.getMilliseconds()).padStart(2, "0");

  //   const timestamp = `${year}-${month}-${day}-${hours}-${minutes}-${seconds}${milliseconds}`;
  //   const indexSuffix = !isNaN(index) ? `-${index}` : "";

  //   return `file/subdir/_${timestamp}${indexSuffix}.${ext}`;
  // }
}
