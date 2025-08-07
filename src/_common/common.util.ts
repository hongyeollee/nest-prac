import { Injectable } from "@nestjs/common";

@Injectable()
export class CommonUtil {
  private strings =
    "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ01234567890!@#$%^&*()";

  generateRandomString(length: number, customParameter?: string): string {
    let result: string = "";
    customParameter = customParameter || this.strings;
    for (let i = 0; i < length; i++) {
      const randomIdx = Math.floor(Math.random() * customParameter.length);
      result += customParameter.charAt(randomIdx);
    }

    return result;
  }
}
