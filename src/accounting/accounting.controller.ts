import {
  Body,
  Controller,
  Get,
  HttpStatus,
  Post,
  Query,
  Res,
} from "@nestjs/common";
import { ApiOkResponse, ApiOperation, ApiTags } from "@nestjs/swagger";
import { Response } from "express";
import { AccountingService } from "./accounting.service";
import { GenerateJournalDto } from "./dto/generate-journal.dto";
import { InboxQueryDto } from "./dto/inbox.query.dto";
import { ExportExcelQueryDto } from "./dto/export-excel.query.dto";

@Controller("/account")
@ApiTags("회계 자동화")
export class AccountingController {
  constructor(private accountingService: AccountingService) {}

  @Post("sync/notion")
  @ApiOperation({
    summary: "노션 거래 동기화",
    description: "노션 거래 데이터를 시스템으로 동기화합니다.",
  })
  @ApiOkResponse({
    description: "동기화 결과",
  })
  async syncNotion() {
    const result = await this.accountingService.syncNotion();

    return {
      message: "success",
      statusCode: HttpStatus.OK,
      ...result,
    };
  }

  @Post("journal/generate")
  @ApiOperation({
    summary: "분개 생성",
    description: "거래 데이터를 기반으로 분개를 생성합니다.",
  })
  @ApiOkResponse({
    description: "분개 생성 결과",
  })
  async generateJournal(@Body() payload: GenerateJournalDto) {
    const result = await this.accountingService.generateJournalEntries(payload);

    return {
      message: "success",
      statusCode: HttpStatus.OK,
      ...result,
    };
  }

  @Get("inbox")
  @ApiOperation({
    summary: "검토 필요 거래 조회",
    description: "검토가 필요한 거래 목록을 조회합니다.",
  })
  @ApiOkResponse({
    description: "검토 목록",
  })
  async getInbox(@Query() query: InboxQueryDto) {
    const result = await this.accountingService.getInbox(query);

    return {
      message: "success",
      statusCode: HttpStatus.OK,
      ...result,
    };
  }

  @Get("export/excel")
  @ApiOperation({
    summary: "엑셀 내보내기",
    description: "분개장과 시산표를 엑셀용 데이터로 반환합니다.",
  })
  @ApiOkResponse({
    description: "엑셀용 데이터",
  })
  async exportExcel(
    @Query() query: ExportExcelQueryDto,
    @Res() response: Response,
  ) {
    const buffer = await this.accountingService.exportExcel(query);
    response.setHeader(
      "Content-Type",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    );
    response.setHeader(
      "Content-Disposition",
      "attachment; filename=accounting-export.xlsx",
    );
    response.status(HttpStatus.OK).send(buffer);
  }
}
