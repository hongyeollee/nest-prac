import { MigrationInterface, QueryRunner } from "typeorm";

export class AddAccountingTables1769664287452 implements MigrationInterface {
  name = "AddAccountingTables1769664287452";

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE \`accounting_journal_line\` (\`id\` int UNSIGNED NOT NULL AUTO_INCREMENT COMMENT '분개 라인 고유아이디', \`journalEntryId\` int UNSIGNED NOT NULL COMMENT '분개 고유아이디', \`account\` varchar(120) NOT NULL COMMENT '계정과목', \`side\` enum ('DEBIT', 'CREDIT') NOT NULL COMMENT '차변/대변', \`amount\` decimal(14,2) NOT NULL COMMENT '금액', \`createdDt\` datetime(0) NOT NULL COMMENT '라인 생성일' DEFAULT CURRENT_TIMESTAMP(0), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`,
    );
    await queryRunner.query(
      `CREATE TABLE \`accounting_journal_entry\` (\`id\` int UNSIGNED NOT NULL AUTO_INCREMENT COMMENT '분개 고유아이디', \`transactionId\` int UNSIGNED NOT NULL COMMENT '거래 고유아이디', \`isBalanced\` tinyint NOT NULL COMMENT '차변/대변 일치 여부' DEFAULT 0, \`memo\` varchar(500) NULL COMMENT '분개 메모', \`createdDt\` datetime(0) NOT NULL COMMENT '분개 데이터 생성일' DEFAULT CURRENT_TIMESTAMP(0), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`,
    );
    await queryRunner.query(
      `CREATE TABLE \`accounting_transaction\` (\`id\` int UNSIGNED NOT NULL AUTO_INCREMENT COMMENT '거래 고유아이디', \`notionPageId\` varchar(128) NOT NULL COMMENT '노션 페이지 아이디', \`date\` date NOT NULL COMMENT '거래 날짜', \`type\` enum ('SALE', 'EXPENSE') NOT NULL COMMENT '거래 유형', \`amount\` decimal(14,2) NOT NULL COMMENT '거래 금액', \`amountIncludesVat\` tinyint NOT NULL COMMENT '부가세 포함 여부' DEFAULT 1, \`vatType\` enum ('TAXABLE', 'ZERO', 'EXEMPT') NOT NULL COMMENT '부가세 유형' DEFAULT 'TAXABLE', \`category\` varchar(100) NOT NULL COMMENT '분류', \`counterparty\` varchar(150) NULL COMMENT '거래처', \`memo\` varchar(500) NULL COMMENT '메모', \`status\` enum ('READY', 'REVIEW', 'PROCESSED') NOT NULL COMMENT '처리 상태' DEFAULT 'READY', \`error\` varchar(500) NULL COMMENT '에러 메시지', \`createdDt\` datetime(0) NOT NULL COMMENT '거래 데이터 생성일' DEFAULT CURRENT_TIMESTAMP(0), \`updatedDt\` datetime(0) NULL COMMENT '거래 데이터 수정일' DEFAULT CURRENT_TIMESTAMP(0) ON UPDATE CURRENT_TIMESTAMP(0), UNIQUE INDEX \`IDX_7f41699065c686d82a52c462e6\` (\`notionPageId\`), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`,
    );
    await queryRunner.query(
      `CREATE TABLE \`accounting_rule\` (\`id\` int UNSIGNED NOT NULL AUTO_INCREMENT COMMENT '규칙 고유아이디', \`category\` varchar(100) NOT NULL COMMENT '카테고리', \`type\` enum ('SALE', 'EXPENSE') NOT NULL COMMENT '거래 유형', \`debitAccount\` varchar(120) NOT NULL COMMENT '차변 계정', \`creditAccount\` varchar(120) NOT NULL COMMENT '대변 계정', \`vatMode\` enum ('SPLIT', 'NONE') NOT NULL COMMENT '부가세 분리 방식' DEFAULT 'SPLIT', \`createdDt\` datetime(0) NOT NULL COMMENT '규칙 데이터 생성일' DEFAULT CURRENT_TIMESTAMP(0), \`updatedDt\` datetime(0) NULL COMMENT '규칙 데이터 수정일' DEFAULT CURRENT_TIMESTAMP(0) ON UPDATE CURRENT_TIMESTAMP(0), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`,
    );
    await queryRunner.query(
      `ALTER TABLE \`accounting_journal_line\` ADD CONSTRAINT \`FK_9f25eb2cb69f17c9e0a4ce022d9\` FOREIGN KEY (\`journalEntryId\`) REFERENCES \`accounting_journal_entry\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE \`accounting_journal_entry\` ADD CONSTRAINT \`FK_9c667c92cbb4f9e9bdcca727baa\` FOREIGN KEY (\`transactionId\`) REFERENCES \`accounting_transaction\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE \`accounting_journal_entry\` DROP FOREIGN KEY \`FK_9c667c92cbb4f9e9bdcca727baa\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`accounting_journal_line\` DROP FOREIGN KEY \`FK_9f25eb2cb69f17c9e0a4ce022d9\``,
    );
    await queryRunner.query(`DROP TABLE \`accounting_rule\``);
    await queryRunner.query(
      `DROP INDEX \`IDX_7f41699065c686d82a52c462e6\` ON \`accounting_transaction\``,
    );
    await queryRunner.query(`DROP TABLE \`accounting_transaction\``);
    await queryRunner.query(`DROP TABLE \`accounting_journal_entry\``);
    await queryRunner.query(`DROP TABLE \`accounting_journal_line\``);
  }
}
