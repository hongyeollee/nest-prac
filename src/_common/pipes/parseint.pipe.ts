import { ArgumentMetadata, Injectable, PipeTransform } from "@nestjs/common";

@Injectable()
export class ParseintPipe implements PipeTransform {
  transform(value: string, metadata?: ArgumentMetadata) {
    return parseInt(value, 10);
  }
}
