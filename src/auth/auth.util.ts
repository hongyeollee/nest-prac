import { BadRequestException, Inject, Injectable } from "@nestjs/common";
import { CACHE_MANAGER } from "@nestjs/cache-manager";
import { Cache } from "cache-manager";
@Injectable()
export class AuthUtil {
  constructor(@Inject(CACHE_MANAGER) private cacheManager: Cache) {}
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

  async setRefreshTokenByRedis(
    refreshToken: string,
    userUuid: string,
  ): Promise<string> {
    if (!refreshToken || !userUuid) {
      throw new BadRequestException("Invalid parameter setRefreshTokenByRedis");
    }

    const result = await this.cacheManager.set(
      authRefreshTokenRedisKey(userUuid),
      refreshToken,
      REFRESH_TOKEN_REDIS_TTL,
    );
    // console.log("✅ setRefreshTokenByRedis ===> ", result); // 레디스 데이터 작동여부 확인용 콘솔로그(차후 발견시 불필요하다고 판단되면 지워도 무방)
    return result;
  }

  async delRefreshTokenByRedis(userUuid: string): Promise<boolean> {
    if (!userUuid) {
      throw new BadRequestException("Invalid parameter delRefreshTokenByRedis");
    }

    const result = await this.cacheManager.del(
      authRefreshTokenRedisKey(userUuid),
    );
    // console.log("✅ delRefreshTokenByRedis ===> ", result); // 레디스 데이터 작동여부 확인용 콘솔로그(차후 발견시 불필요하다고 판단되면 지워도 무방)
    return result;
  }

  async getRefreshTokenByRedis(userUuid: string): Promise<unknown> {
    if (!userUuid) {
      throw new BadRequestException("Invalid parameter getRefreshTokenByRedis");
    }

    const result = await this.cacheManager.get(
      authRefreshTokenRedisKey(userUuid),
    );
    // console.log("✅ getRefreshTokenByRedis ===> ", result); // 레디스 데이터 작동여부 확인용 콘솔로그(차후 발견시 불필요하다고 판단되면 지워도 무방)
    return result;
  }
}

export const REFRESH_TOKEN_REDIS_TTL = 1000 * 60 * 60 * 24 * 7;
export const authRefreshTokenRedisKey = (userUuid: string): string =>
  `auth:refreshToken:${userUuid}`;
