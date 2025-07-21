import {
  DeleteObjectCommand,
  PutObjectCommand,
  S3Client,
} from "@aws-sdk/client-s3";
import {
  ArgumentMetadata,
  Injectable,
  InternalServerErrorException,
  NotAcceptableException,
  NotFoundException,
  PipeTransform,
} from "@nestjs/common";
import { extname, basename } from "path";

@Injectable()
export class FileSizeValidationPipe implements PipeTransform {
  transform(value: any, metadata: ArgumentMetadata) {
    const maxSizebyte = 5 * 1024 * 1024; // 5MB
    if (!value) {
      throw new NotFoundException("not found value");
    }
    if (value.size > maxSizebyte) {
      throw new NotAcceptableException("value more than maxSizeKb");
    }

    return value.size < maxSizebyte;
  }
}

Injectable();
export class FileUploadUtil {
  private s3: S3Client;
  private bucket: string;

  constructor() {
    this.s3 = new S3Client({
      region: process.env.AWS_REGION,
      credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
      },
    });
    this.bucket = process.env.AWS_S3_BUCKET;
  }
  generateFileKey(filename: string, subdir: string): string {
    const ext = extname(filename);
    const fileDateAndExt = `${this.getDatePrefix()}/${ext}`;
    return `${subdir}/${fileDateAndExt}`;
  }

  getDatePrefix(): string {
    const now = new Date();
    const year = String(now.getFullYear()).padStart(2, "0");
    const month = String(now.getMonth() + 1).padStart(2, "0");
    const day = String(now.getDate()).padStart(2, "0");
    const hours = String(now.getHours()).padStart(2, "0");
    const minutes = String(now.getMinutes()).padStart(2, "0");
    const seconds = String(now.getSeconds()).padStart(2, "0");
    const milliseconds = String(now.getMilliseconds()).padStart(2, "0");

    const timestamp = `${year}-${month}-${day}T${hours}:${minutes}:${seconds}.${milliseconds}`;

    return timestamp;
  }

  getFileUrl(key: string): string {
    return `https://${this.bucket}.s3.${process.env.AWS_REGION}.amazonaws.com/${key}`;
  }

  async uploadS3(buffer: Buffer, mimetype: string, key: string): Promise<void> {
    try {
      await this.s3.send(
        new PutObjectCommand({
          Bucket: this.bucket,
          Key: key,
          Body: buffer,
          ContentType: mimetype,
          // ACL: "public-read", => 해당 버킷 정책에 대한 설정 또는 수정이 가능한 경우에 사용할 수 있음.
        }),
      );
    } catch (error) {
      console.error(error);
      throw new InternalServerErrorException("fail upload single file uplaod");
    }
  }

  async deleteFromS3(key: string): Promise<void> {
    try {
      const command = new DeleteObjectCommand({
        Bucket: this.bucket,
        Key: key,
      });
      await this.s3.send(command);
    } catch (error) {
      console.error(`[S3 Delete Error] key: ${key}`, error);
      // 삭제 실패는 로깅만 남기고 예외를 재전파하지 않아야 전체 롤백에 영향 없음
    }
  }

  safeName(filename: string): string {
    const base = basename(filename);
    const safename = encodeURIComponent(base);

    return safename;
  }
}
