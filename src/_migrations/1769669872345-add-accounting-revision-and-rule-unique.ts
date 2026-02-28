import { MigrationInterface, QueryRunner } from "typeorm";

export class AddAccountingRevisionAndRuleUnique1769669872345
  implements MigrationInterface
{
  name = "AddAccountingRevisionAndRuleUnique1769669872345";

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      "ALTER TABLE `accounting_transaction` DROP INDEX `IDX_7f41699065c686d82a52c462e6`",
    );
    await queryRunner.query(
      "ALTER TABLE `accounting_transaction` ADD `revision` int UNSIGNED NOT NULL DEFAULT 1 COMMENT '정정 버전'",
    );
    await queryRunner.query(
      "ALTER TABLE `accounting_transaction` ADD `correctedFromId` int UNSIGNED NULL COMMENT '정정 원거래 아이디'",
    );
    await queryRunner.query(
      "ALTER TABLE `accounting_transaction` ADD `correctionReason` varchar(500) NULL COMMENT '정정 사유'",
    );
    await queryRunner.query(
      "ALTER TABLE `accounting_transaction` ADD `cancellationReason` varchar(500) NULL COMMENT '취소 사유'",
    );
    await queryRunner.query(
      "ALTER TABLE `accounting_transaction` ADD `notionLastEditedAt` datetime(0) NULL COMMENT '노션 최종 수정일'",
    );
    await queryRunner.query(
      "ALTER TABLE `accounting_transaction` MODIFY `status` enum ('READY','REVIEW','PROCESSED','CORRECTED','CANCELLED') NOT NULL COMMENT '처리 상태' DEFAULT 'READY'",
    );
    await queryRunner.query(
      "CREATE INDEX `idx_accounting_transaction_notionPageId` ON `accounting_transaction` (`notionPageId`)",
    );
    await queryRunner.query(
      "CREATE UNIQUE INDEX `uniq_accounting_rule_type_category` ON `accounting_rule` (`type`, `category`)",
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      "DROP INDEX `uniq_accounting_rule_type_category` ON `accounting_rule`",
    );
    await queryRunner.query(
      "DROP INDEX `idx_accounting_transaction_notionPageId` ON `accounting_transaction`",
    );
    await queryRunner.query(
      "ALTER TABLE `accounting_transaction` MODIFY `status` enum ('READY','REVIEW','PROCESSED') NOT NULL COMMENT '처리 상태' DEFAULT 'READY'",
    );
    await queryRunner.query(
      "ALTER TABLE `accounting_transaction` DROP COLUMN `notionLastEditedAt`",
    );
    await queryRunner.query(
      "ALTER TABLE `accounting_transaction` DROP COLUMN `cancellationReason`",
    );
    await queryRunner.query(
      "ALTER TABLE `accounting_transaction` DROP COLUMN `correctionReason`",
    );
    await queryRunner.query(
      "ALTER TABLE `accounting_transaction` DROP COLUMN `correctedFromId`",
    );
    await queryRunner.query(
      "ALTER TABLE `accounting_transaction` DROP COLUMN `revision`",
    );
    await queryRunner.query(
      "CREATE UNIQUE INDEX `IDX_7f41699065c686d82a52c462e6` ON `accounting_transaction` (`notionPageId`)",
    );
  }
}
