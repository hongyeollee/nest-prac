import { ArgumentMetadata, Injectable, PipeTransform } from "@nestjs/common";

@Injectable()
export class UpperCasePipe implements PipeTransform {
  transform(value: string, metadata?: ArgumentMetadata) {
    return value?.toUpperCase();
  }
}
