import { ApiProperty } from "@nestjs/swagger";
import { ResponseGetUserDto } from "./response-get-user.dto";

export class ResponseGetUserListDTO {
  @ApiProperty({ type: [ResponseGetUserDto] })
  list: ResponseGetUserDto[];
}
