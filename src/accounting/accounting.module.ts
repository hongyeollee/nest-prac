import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { AccountingController } from "./accounting.controller";
import { AccountingService } from "./accounting.service";
import { AccountingRuleEntity } from "entities/accounting/rule.entity";
import { AccountingTransactionEntity } from "entities/accounting/transaction.entity";
import { AccountingJournalEntryEntity } from "entities/accounting/journal-entry.entity";
import { AccountingJournalLineEntity } from "entities/accounting/journal-line.entity";

@Module({
  imports: [
    TypeOrmModule.forFeature([
      AccountingTransactionEntity,
      AccountingRuleEntity,
      AccountingJournalEntryEntity,
      AccountingJournalLineEntity,
    ]),
  ],
  controllers: [AccountingController],
  providers: [AccountingService],
  exports: [TypeOrmModule],
})
export class AccountingModule {}
