import { ApiProperty } from "@nestjs/swagger";
import { ResponseGetUserDTO } from "./response-get-user.dto";

export class ResponseGetUserListDTO {
  @ApiProperty({ type: [ResponseGetUserDTO] })
  list: ResponseGetUserDTO[];
}
