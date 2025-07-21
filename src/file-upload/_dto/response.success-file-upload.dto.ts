import { ApiProperty } from "@nestjs/swagger";
import { ResponseCommonSuccessDTO } from "src/_common/_dto/common-success-response.dto";

export class ResponseSingleUploadItemDTO {
  @ApiProperty({
    example:
      "https://abcd.s3.north-apredadd.amazone.com/profile/2025-07-20T13:00:05.02/image/png",
  })
  url: string;

  @ApiProperty({ example: "filename.png" })
  @ApiProperty({ example: "profile/2025-07-20T13:00:05.02/png" })
  key: string;
}

export class ResponseSuccessFileUploadDTO extends ResponseCommonSuccessDTO {
  @ApiProperty({ type: ResponseSingleUploadItemDTO })
  data: ResponseSingleUploadItemDTO;
}

export class ResponseSuccessFilesUploadDTO extends ResponseCommonSuccessDTO {
  @ApiProperty({ type: [ResponseSingleUploadItemDTO] })
  data: ResponseSingleUploadItemDTO[];
}
