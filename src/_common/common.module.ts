import { Global, Module } from "@nestjs/common";
import { CommonUtil } from "./common.util";

@Global()
@Module({
  providers: [CommonUtil],
  exports: [CommonUtil],
})
export class CommonModule {}
