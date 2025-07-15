import { ArgumentMetadata, Injectable, PipeTransform } from "@nestjs/common";

@Injectable()
export  class FileSizeValidationPipe implements PipeTransform {
  transform(value: any, metadata: ArgumentMetadata) {
    const targetKb = 10000
    return value.size < targetKb
  }
}