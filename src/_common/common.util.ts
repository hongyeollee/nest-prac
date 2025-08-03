import { Injectable } from "@nestjs/common";

@Injectable()
export class CommonUtil {
  private strings =
    "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ01234567890!@#$%^&*()";

  generateRandomString(length: number): string {
    let result: string = "";
    for (let i = 0; i < length; i++) {
      const randomIdx = Math.floor(Math.random() * this.strings.length);
      result += this.strings.charAt(randomIdx);
    }

    return result;
  }
}
