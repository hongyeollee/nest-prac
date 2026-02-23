import {
  Body,
  Controller,
  Get,
  HttpStatus,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query,
  Res,
  Delete,
} from "@nestjs/common";
import { ApiOkResponse, ApiOperation, ApiTags } from "@nestjs/swagger";
import { Response } from "express";
import { AccountingService } from "./accounting.service";
import { GenerateJournalDto } from "./dto/generate-journal.dto";
import { RebuildJournalDto } from "./dto/rebuild-journal.dto";
import { InboxQueryDto } from "./dto/inbox.query.dto";
import { ExportExcelQueryDto } from "./dto/export-excel.query.dto";
import { RuleQueryDto } from "./dto/rule-query.dto";
import { CreateRuleDto } from "./dto/create-rule.dto";
import { UpdateRuleDto } from "./dto/update-rule.dto";

@Controller("/account")
@ApiTags("회계 자동화")
export class AccountingController {
  constructor(private accountingService: AccountingService) {}

  @Post("sync/notion")
  @ApiOperation({
    summary: "노션 거래 동기화",
    description: `
    노션 거래 데이터를 시스템으로 동기화합니다.
    노션 데이터베이스 활용을 위해서는 노션API 환경변수(통합 API, 노션 데이터베이스 API)가 필요하며, 
    노션 데이터베이스 폼이 준비되어있어야 합니다.(폼은 직접 연락주세요.)
    `,
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

  @Post("journal/rebuild")
  @ApiOperation({
    summary: "분개 재생성",
    description: "규칙 기준으로 분개를 재생성합니다.",
  })
  @ApiOkResponse({
    description: "분개 재생성 결과",
  })
  async rebuildJournal(@Body() payload: RebuildJournalDto) {
    const result = await this.accountingService.rebuildJournalEntries(payload);

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

  @Get("rule")
  @ApiOperation({
    summary: "분개 규칙 조회",
    description: "분개 규칙 목록을 조회합니다.",
  })
  @ApiOkResponse({
    description: "규칙 목록",
  })
  async getRules(@Query() query: RuleQueryDto) {
    const result = await this.accountingService.getRules(query);

    return {
      message: "success",
      statusCode: HttpStatus.OK,
      ...result,
    };
  }

  @Post("rule")
  @ApiOperation({
    summary: "분개 규칙 생성",
    description: "분개 규칙을 생성합니다.",
  })
  @ApiOkResponse({
    description: "규칙 생성 결과",
  })
  async createRule(@Body() payload: CreateRuleDto) {
    const rule = await this.accountingService.createRule(payload);

    return {
      message: "success",
      statusCode: HttpStatus.OK,
      rule,
    };
  }

  @Patch("rule/:id")
  @ApiOperation({
    summary: "분개 규칙 수정",
    description: "분개 규칙을 수정합니다.",
  })
  @ApiOkResponse({
    description: "규칙 수정 결과",
  })
  async updateRule(
    @Param("id", ParseIntPipe) id: number,
    @Body() payload: UpdateRuleDto,
  ) {
    const rule = await this.accountingService.updateRule(id, payload);

    return {
      message: "success",
      statusCode: HttpStatus.OK,
      rule,
    };
  }

  @Delete("rule/:id")
  @ApiOperation({
    summary: "분개 규칙 삭제",
    description: "분개 규칙을 삭제합니다.",
  })
  @ApiOkResponse({
    description: "규칙 삭제 결과",
  })
  async deleteRule(@Param("id", ParseIntPipe) id: number) {
    const result = await this.accountingService.deleteRule(id);

    return {
      message: "success",
      statusCode: HttpStatus.OK,
      ...result,
    };
  }
}
