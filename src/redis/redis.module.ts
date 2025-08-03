import KeyvRedis from "@keyv/redis";
import { CacheModule } from "@nestjs/cache-manager";
import { Module } from "@nestjs/common";
import { isDevelopment, isDockerLocal, isProduction } from "src/_config/config";

@Module({
  imports: [
    CacheModule.registerAsync({
      isGlobal: true,
      useFactory: async () => {
        const host =
          isProduction() || isDevelopment() || isDockerLocal()
            ? "redis://redis:6379"
            : "redis://localhost:6379";
        // console.log("host ===>", host);
        return {
          stores: [new KeyvRedis(host)],
          ttl: 1000 * 60, // default 1m
        };
      },
    }),
  ],
  exports: [],
})
export class RedisCacheModule {}
