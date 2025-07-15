import { Injectable, NotFoundException } from "@nestjs/common";
import { extname } from "path";

@Injectable()
export class FileUploadService {
  constructor() {}

  async fileUploadsingluar(file: Express.Multer.File , body: any) {
    const dataBuffuer = file?.buffer
    if(!dataBuffuer) {
      throw new NotFoundException('file not found')
    }

    const ext = extname(file.originalname).replace('.', '')
    const subdir = body.subdir as string
    const uploadName = this.generateFileName(subdir, ext)

    return this.getLocation(uploadName)
  }

  async fileUploadPlural(file, body) {}

  private getLocation(info: string) {
    // return `https://${this.AWS_S3_BUCKET}.s3.${this.configService.get('AWS_REGION')}.amazonaws.com/${key}`
    return `https://${'ㅇㅇㅇ'}.s3.~~~.amazonaws.com/${info}`
  }

  private generateFileName(subdir: string, ext: string, index?: number) {
    const date = new Date()
    const year = String(date.getFullYear()).padStart(2, '0')
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const day = String(date.getDate()).padStart(2, '0')
    const hours = String(date.getHours()).padStart(2, '0')
    const minutes = String(date.getMinutes()).padStart(2, '0')
    const seconds = String(date.getSeconds()).padStart(2, '0')
    const milliseconds = String(date.getMilliseconds()).padStart(2, '0')

    const timestamp = `${year}-${month}-${day}-${hours}-${minutes}-${seconds}${milliseconds}`
    const indexSuffix = !isNaN(index) ? `-${index}` : ''

    return `file/subdir/_${timestamp}${indexSuffix}.${ext}`
  }
}