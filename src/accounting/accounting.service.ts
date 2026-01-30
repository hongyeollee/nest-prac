import { BadRequestException, Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Between, LessThanOrEqual, MoreThanOrEqual, Repository } from "typeorm";
import { Client } from "@notionhq/client";
import * as ExcelJS from "exceljs";
import {
  AccountingLineSide,
  AccountingTransactionStatus,
  AccountingTransactionType,
  AccountingVatMode,
  AccountingVatType,
} from "entities/accounting/accounting.enums";
import { AccountingRuleEntity } from "entities/accounting/rule.entity";
import { AccountingTransactionEntity } from "entities/accounting/transaction.entity";
import { AccountingJournalEntryEntity } from "entities/accounting/journal-entry.entity";
import { AccountingJournalLineEntity } from "entities/accounting/journal-line.entity";
import { NotionTransactionDto } from "./dto/notion-transaction.dto";
import { GenerateJournalDto } from "./dto/generate-journal.dto";
import { ExportExcelQueryDto } from "./dto/export-excel.query.dto";
import { InboxQueryDto } from "./dto/inbox.query.dto";

type TrialBalanceRow = {
  account: string;
  debit: string;
  credit: string;
};

@Injectable()
export class AccountingService {
  constructor(
    @InjectRepository(AccountingTransactionEntity)
    private transactionRepository: Repository<AccountingTransactionEntity>,
    @InjectRepository(AccountingRuleEntity)
    private ruleRepository: Repository<AccountingRuleEntity>,
    @InjectRepository(AccountingJournalEntryEntity)
    private journalEntryRepository: Repository<AccountingJournalEntryEntity>,
    @InjectRepository(AccountingJournalLineEntity)
    private journalLineRepository: Repository<AccountingJournalLineEntity>,
  ) {}

  private notionPropertyMap = {
    date: "날짜",
    type: "유형",
    amount: "금액",
    amountIncludesVat: "부가세 포함",
    vatType: "부가세 유형",
    category: "분류",
    counterparty: "거래처",
    memo: "메모",
  };

  async syncNotion() {
    const { transactions, skippedCount } = await this.fetchNotionTransactions();
    const synced = [] as AccountingTransactionEntity[];

    for (const transaction of transactions) {
      const existing = await this.transactionRepository.findOne({
        where: { notionPageId: transaction.notionPageId },
      });

      const entity = this.transactionRepository.create({
        id: existing?.id,
        notionPageId: transaction.notionPageId,
        date: new Date(transaction.date),
        type: transaction.type,
        amount: this.formatAmount(transaction.amount),
        amountIncludesVat: transaction.amountIncludesVat,
        vatType: transaction.vatType,
        category: transaction.category,
        counterparty: transaction.counterparty ?? null,
        memo: transaction.memo ?? null,
        status: AccountingTransactionStatus.Ready,
        error: null,
      });

      synced.push(await this.transactionRepository.save(entity));
    }

    return {
      syncedCount: synced.length,
      skippedCount,
    };
  }

  async generateJournalEntries(payload: GenerateJournalDto) {
    const ruleMap = await this.buildRuleMap();
    const transactions = await this.transactionRepository.find({
      where: {
        status: AccountingTransactionStatus.Ready,
        ...this.buildDateRangeFilter(payload),
      },
      order: { date: "ASC" },
    });

    let createdCount = 0;
    let reviewCount = 0;
    let processedCount = 0;
    const missingRuleCategories = new Set<string>();

    for (const transaction of transactions) {
      const ruleKey = this.getRuleKey(transaction.type, transaction.category);
      const rule = ruleMap.get(ruleKey);

      if (!rule) {
        transaction.status = AccountingTransactionStatus.Review;
        transaction.error = "rule not found";
        missingRuleCategories.add(transaction.category);
        await this.transactionRepository.save(transaction);
        reviewCount += 1;
        continue;
      }

      const journalLines = this.buildJournalLines(transaction, rule);
      const isBalanced = this.isBalanced(journalLines);

      const entry = this.journalEntryRepository.create({
        transactionId: transaction.id,
        memo: transaction.memo ?? null,
        isBalanced,
        lines: journalLines,
      });

      await this.journalEntryRepository.save(entry);
      createdCount += 1;

      if (!isBalanced) {
        transaction.status = AccountingTransactionStatus.Review;
        transaction.error = "debit and credit mismatch";
        reviewCount += 1;
      } else {
        transaction.status = AccountingTransactionStatus.Processed;
        transaction.error = null;
        processedCount += 1;
      }

      await this.transactionRepository.save(transaction);
    }

    if (missingRuleCategories.size > 0) {
      throw new BadRequestException({
        message: "missing accounting rules",
        missingCategories: Array.from(missingRuleCategories),
        createdCount,
        processedCount,
        reviewCount,
      });
    }

    return {
      createdCount,
      processedCount,
      reviewCount,
    };
  }

  async getInbox(query: InboxQueryDto) {
    const status = query.status ?? AccountingTransactionStatus.Review;
    const transactions = await this.transactionRepository.find({
      where: { status },
      order: { date: "DESC" },
    });

    return {
      status,
      totalCount: transactions.length,
      transactions,
    };
  }

  async exportExcel(query: ExportExcelQueryDto) {
    const data = await this.exportExcelData(query);
    const workbook = new ExcelJS.Workbook();

    const journalSheet = workbook.addWorksheet("Journal");
    journalSheet.columns = [
      { header: "date(날짜)", key: "date", width: 14 },
      { header: "entryId(분개번호)", key: "entryId", width: 14 },
      { header: "transactionId(거래번호)", key: "transactionId", width: 16 },
      { header: "type(유형)", key: "type", width: 12 },
      { header: "category(분류)", key: "category", width: 16 },
      { header: "counterparty(거래처)", key: "counterparty", width: 20 },
      { header: "memo(메모)", key: "memo", width: 24 },
      { header: "account(계정과목)", key: "account", width: 18 },
      { header: "debit(차변)", key: "debit", width: 14 },
      { header: "credit(대변)", key: "credit", width: 14 },
    ];
    const journalRows = data.journalRows.map((row) => {
      const amount = this.toNumber(row.amount);
      return {
        date: row.date,
        entryId: row.entryId,
        transactionId: row.transactionId,
        type: row.type,
        category: row.category,
        counterparty: row.counterparty ?? "",
        memo: row.memo ?? "",
        account: row.account,
        debit: row.side === AccountingLineSide.Debit ? amount : null,
        credit: row.side === AccountingLineSide.Credit ? amount : null,
      };
    });
    journalSheet.addRows(journalRows);

    const trialSheet = workbook.addWorksheet("TrialBalance");
    trialSheet.columns = [
      { header: "account(계정과목)", key: "account", width: 22 },
      { header: "debit(차변합계)", key: "debit", width: 16 },
      { header: "credit(대변합계)", key: "credit", width: 16 },
    ];

    const trialRows = data.trialBalance.map((row) => ({
      account: row.account,
      debit: this.toNumber(row.debit),
      credit: this.toNumber(row.credit),
    }));
    trialSheet.addRows(trialRows);

    const totalDebit = trialRows.reduce((sum, row) => sum + row.debit, 0);
    const totalCredit = trialRows.reduce((sum, row) => sum + row.credit, 0);
    trialSheet.addRow({
      account: "합계",
      debit: totalDebit,
      credit: totalCredit,
    });

    [journalSheet, trialSheet].forEach((sheet) => {
      sheet.getRow(1).font = { bold: true };
      sheet.views = [{ state: "frozen", ySplit: 1 }];
    });

    journalSheet.getColumn("date").numFmt = "yyyy-mm-dd";
    journalSheet.getColumn("debit").numFmt = "₩#,##0";
    journalSheet.getColumn("credit").numFmt = "₩#,##0";
    journalSheet.getColumn("type").width = 12;

    trialSheet.getColumn("debit").numFmt = "₩#,##0";
    trialSheet.getColumn("credit").numFmt = "₩#,##0";
    trialSheet.getRow(trialSheet.rowCount).font = { bold: true };

    journalSheet.eachRow((row, rowNumber) => {
      if (rowNumber === 1) {
        return;
      }

      const typeCell = row.getCell("type");
      const typeValue = String(typeCell.value ?? "");
      if (!typeValue) {
        return;
      }

      const fillColor =
        typeValue === AccountingTransactionType.Sale
          ? "FFE8F5E9"
          : typeValue === AccountingTransactionType.Expense
            ? "FFFFF3E0"
            : null;

      if (!fillColor) {
        return;
      }

      row.eachCell((cell) => {
        cell.fill = {
          type: "pattern",
          pattern: "solid",
          fgColor: { argb: fillColor },
        };
      });
    });

    const buffer = await workbook.xlsx.writeBuffer();

    return Buffer.isBuffer(buffer) ? buffer : Buffer.from(buffer);
  }

  private async exportExcelData(query: ExportExcelQueryDto) {
    const entries = await this.journalEntryRepository.find({
      where: this.buildDateRangeFilter(query, "createdDt"),
      relations: { lines: true, transaction: true },
      order: { createdDt: "ASC" },
    });

    const journalRows = entries.flatMap((entry) =>
      entry.lines.map((line) => ({
        entryId: entry.id,
        transactionId: entry.transactionId,
        date: entry.transaction?.date,
        type: entry.transaction?.type,
        category: entry.transaction?.category,
        counterparty: entry.transaction?.counterparty,
        memo: entry.memo,
        account: line.account,
        side: line.side,
        amount: line.amount,
      })),
    );

    return {
      journalRows,
      trialBalance: this.buildTrialBalance(entries),
    };
  }

  private async buildRuleMap() {
    const rules = await this.ruleRepository.find();
    const map = new Map<string, AccountingRuleEntity>();

    for (const rule of rules) {
      map.set(this.getRuleKey(rule.type, rule.category), rule);
    }

    return map;
  }

  private getRuleKey(type: AccountingTransactionType, category: string) {
    return `${type}:${category}`;
  }

  private buildJournalLines(
    transaction: AccountingTransactionEntity,
    rule: AccountingRuleEntity,
  ) {
    const totalAmount = this.toNumber(transaction.amount);
    const { vatAmount, supplyAmount } = this.calculateVat(transaction, rule);
    const lines: AccountingJournalLineEntity[] = [];

    if (transaction.type === AccountingTransactionType.Sale) {
      lines.push(
        this.createLine(
          rule.debitAccount,
          AccountingLineSide.Debit,
          totalAmount,
        ),
      );
      lines.push(
        this.createLine(
          rule.creditAccount,
          AccountingLineSide.Credit,
          supplyAmount,
        ),
      );

      if (vatAmount > 0) {
        lines.push(
          this.createLine("부가세예수금", AccountingLineSide.Credit, vatAmount),
        );
      }
    } else {
      lines.push(
        this.createLine(
          rule.debitAccount,
          AccountingLineSide.Debit,
          supplyAmount,
        ),
      );

      if (vatAmount > 0) {
        lines.push(
          this.createLine("부가세대급금", AccountingLineSide.Debit, vatAmount),
        );
      }

      lines.push(
        this.createLine(
          rule.creditAccount,
          AccountingLineSide.Credit,
          totalAmount,
        ),
      );
    }

    return lines;
  }

  private calculateVat(
    transaction: AccountingTransactionEntity,
    rule: AccountingRuleEntity,
  ) {
    const totalAmount = this.toNumber(transaction.amount);
    const isTaxable =
      transaction.vatType === AccountingVatType.Taxable &&
      transaction.amountIncludesVat &&
      rule.vatMode === AccountingVatMode.Split;

    if (!isTaxable) {
      return { vatAmount: 0, supplyAmount: totalAmount };
    }

    const vatAmount = Math.round(totalAmount / 11);
    return {
      vatAmount,
      supplyAmount: totalAmount - vatAmount,
    };
  }

  private createLine(
    account: string,
    side: AccountingLineSide,
    amount: number,
  ) {
    return this.journalLineRepository.create({
      account,
      side,
      amount: this.formatAmount(amount),
    });
  }

  private isBalanced(lines: AccountingJournalLineEntity[]) {
    const totals = lines.reduce(
      (acc, line) => {
        const amount = this.toNumber(line.amount);
        if (line.side === AccountingLineSide.Debit) {
          acc.debit += amount;
        } else {
          acc.credit += amount;
        }
        return acc;
      },
      { debit: 0, credit: 0 },
    );

    return Math.abs(totals.debit - totals.credit) < 0.01;
  }

  private buildTrialBalance(entries: AccountingJournalEntryEntity[]) {
    const balances = new Map<string, { debit: number; credit: number }>();

    for (const entry of entries) {
      for (const line of entry.lines) {
        const amount = this.toNumber(line.amount);
        const current = balances.get(line.account) ?? { debit: 0, credit: 0 };

        if (line.side === AccountingLineSide.Debit) {
          current.debit += amount;
        } else {
          current.credit += amount;
        }

        balances.set(line.account, current);
      }
    }

    return Array.from(balances.entries()).map(([account, balance]) => ({
      account,
      debit: this.formatAmount(balance.debit),
      credit: this.formatAmount(balance.credit),
    })) as TrialBalanceRow[];
  }

  private buildDateRangeFilter(
    payload: { startDate?: string; endDate?: string },
    field: "date" | "createdDt" = "date",
  ) {
    const { startDate, endDate } = payload;

    if (startDate && endDate) {
      return { [field]: Between(new Date(startDate), new Date(endDate)) };
    }

    if (startDate) {
      return { [field]: MoreThanOrEqual(new Date(startDate)) };
    }

    if (endDate) {
      return { [field]: LessThanOrEqual(new Date(endDate)) };
    }

    return {};
  }

  private formatAmount(amount: number) {
    return amount.toFixed(2);
  }

  private toNumber(amount: string | number) {
    return typeof amount === "string" ? Number(amount) : amount;
  }

  private async fetchNotionTransactions(startDate?: string, endDate?: string) {
    const notionToken = process.env.NOTION_TOKEN;
    const notionDbId = this.normalizeNotionId(process.env.NOTION_DB_ID);

    if (!notionToken || !notionDbId) {
      throw new BadRequestException("Notion integration is not configured");
    }

    const notion = new Client({ auth: notionToken });
    const filters = [] as any[];

    if (startDate) {
      filters.push({
        property: this.notionPropertyMap.date,
        date: { on_or_after: startDate },
      });
    }

    if (endDate) {
      filters.push({
        property: this.notionPropertyMap.date,
        date: { on_or_before: endDate },
      });
    }

    const filter: any =
      filters.length === 0
        ? undefined
        : filters.length === 1
          ? filters[0]
          : { and: filters };

    const database = (await notion.databases.retrieve({
      database_id: notionDbId,
    })) as any;
    const dataSourceId = database.data_sources?.[0]?.id;

    if (!dataSourceId) {
      throw new BadRequestException("Notion data source is not available");
    }

    const results = [] as any[];
    let cursor: string | undefined;

    do {
      const response = await notion.dataSources.query({
        data_source_id: dataSourceId,
        start_cursor: cursor,
        filter,
      });

      results.push(...response.results);
      cursor = response.has_more
        ? response.next_cursor ?? undefined
        : undefined;
    } while (cursor);

    const transactions: NotionTransactionDto[] = [];
    let skippedCount = 0;

    for (const page of results) {
      const parsed = this.parseNotionPage(page);

      if (!parsed) {
        skippedCount += 1;
        continue;
      }

      transactions.push(parsed);
    }

    return { transactions, skippedCount };
  }

  private parseNotionPage(page: any): NotionTransactionDto | null {
    const properties = page.properties ?? {};
    const notionPageId = page.id;
    const dateValue = this.getDateProperty(
      properties,
      this.notionPropertyMap.date,
    );
    const typeValue = this.getSelectProperty(
      properties,
      this.notionPropertyMap.type,
    );
    const amountValue = this.getNumberProperty(
      properties,
      this.notionPropertyMap.amount,
    );
    const vatIncluded = this.getCheckboxProperty(
      properties,
      this.notionPropertyMap.amountIncludesVat,
    );
    const vatTypeValue = this.getSelectProperty(
      properties,
      this.notionPropertyMap.vatType,
    );
    const categoryValue =
      this.getTextProperty(properties, this.notionPropertyMap.category) ??
      typeValue;

    if (
      !notionPageId ||
      !dateValue ||
      !typeValue ||
      amountValue === null ||
      vatIncluded === null ||
      !vatTypeValue ||
      !categoryValue
    ) {
      return null;
    }

    const normalizedType = this.normalizeTransactionType(typeValue);
    const normalizedVatType = this.normalizeVatType(vatTypeValue);

    if (!normalizedType || !normalizedVatType) {
      return null;
    }

    return {
      notionPageId,
      date: dateValue,
      type: normalizedType,
      amount: amountValue,
      amountIncludesVat: vatIncluded,
      vatType: normalizedVatType,
      category: categoryValue,
      counterparty:
        this.getTextProperty(properties, this.notionPropertyMap.counterparty) ??
        undefined,
      memo:
        this.getTextProperty(properties, this.notionPropertyMap.memo) ??
        undefined,
    };
  }

  private getDateProperty(properties: Record<string, any>, key: string) {
    const prop = properties[key];
    if (prop?.type === "date") {
      return prop.date?.start ?? null;
    }
    return null;
  }

  private getSelectProperty(properties: Record<string, any>, key: string) {
    const prop = properties[key];
    if (prop?.type === "select") {
      return prop.select?.name ?? null;
    }
    return this.getTextProperty(properties, key);
  }

  private getNumberProperty(properties: Record<string, any>, key: string) {
    const prop = properties[key];
    if (prop?.type === "number") {
      return typeof prop.number === "number" ? prop.number : null;
    }
    return null;
  }

  private getCheckboxProperty(properties: Record<string, any>, key: string) {
    const prop = properties[key];
    if (prop?.type === "checkbox") {
      return typeof prop.checkbox === "boolean" ? prop.checkbox : null;
    }
    return null;
  }

  private getTextProperty(properties: Record<string, any>, key: string) {
    const prop = properties[key];

    if (prop?.type === "select") {
      return prop.select?.name ?? null;
    }

    if (prop?.type === "title") {
      return prop.title?.map((item: any) => item.plain_text).join("") ?? null;
    }

    if (prop?.type === "rich_text") {
      return (
        prop.rich_text?.map((item: any) => item.plain_text).join("") ?? null
      );
    }

    return null;
  }

  private normalizeTransactionType(value: string) {
    const upper = value.trim().toUpperCase();
    if (upper === AccountingTransactionType.Sale || value === "매출") {
      return AccountingTransactionType.Sale;
    }

    if (
      upper === AccountingTransactionType.Expense ||
      value === "지출" ||
      value === "비용"
    ) {
      return AccountingTransactionType.Expense;
    }

    return null;
  }

  private normalizeVatType(value: string) {
    const upper = value.trim().toUpperCase();
    if (upper === AccountingVatType.Taxable || value === "과세") {
      return AccountingVatType.Taxable;
    }

    if (upper === AccountingVatType.Zero || value === "영세율") {
      return AccountingVatType.Zero;
    }

    if (upper === AccountingVatType.Exempt || value === "면세") {
      return AccountingVatType.Exempt;
    }

    return null;
  }

  private normalizeNotionId(value?: string) {
    if (!value) {
      return null;
    }

    const trimmed = value.trim();
    const match = trimmed.match(/[0-9a-fA-F]{32}/);
    if (match) {
      return match[0].toLowerCase();
    }

    const sanitized = trimmed.replace(/-/g, "");
    if (/^[0-9a-fA-F]{32}$/.test(sanitized)) {
      return sanitized.toLowerCase();
    }

    return null;
  }
}
