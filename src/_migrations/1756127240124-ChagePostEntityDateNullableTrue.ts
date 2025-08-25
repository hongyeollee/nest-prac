import { MigrationInterface, QueryRunner } from "typeorm";

export class ChagePostEntityDateNullableTrue1756127240124 implements MigrationInterface {
    name = 'ChagePostEntityDateNullableTrue1756127240124'

    public async up(queryRunner: QueryRunner): Promise<void> {
     // await queryRunner.query(`DROP INDEX \`post_user_FK\` ON \`post\``);
        await queryRunner.query(`ALTER TABLE \`post\` CHANGE \`createdDt\` \`createdDt\` datetime(0) NOT NULL COMMENT '게시글 데이터 생성일' DEFAULT CURRENT_TIMESTAMP(0)`);
        await queryRunner.query(`ALTER TABLE \`post\` CHANGE \`updatedDt\` \`updatedDt\` datetime(0) NULL COMMENT '게시글 데이터 수정일' DEFAULT CURRENT_TIMESTAMP(0) ON UPDATE CURRENT_TIMESTAMP(0)`);
        await queryRunner.query(`ALTER TABLE \`post\` CHANGE \`deletedDt\` \`deletedDt\` datetime(0) NULL COMMENT '게시글 데이터 삭제일' DEFAULT CURRENT_TIMESTAMP`);
        await queryRunner.query(`ALTER TABLE \`coupon\` CHANGE \`createdDt\` \`createdDt\` datetime(0) NOT NULL COMMENT '쿠폰 정보 생성일시' DEFAULT CURRENT_TIMESTAMP(0)`);
        await queryRunner.query(`ALTER TABLE \`coupon\` CHANGE \`updatedDt\` \`updatedDt\` datetime(0) NULL COMMENT '쿠폰 정보 수정일시' DEFAULT CURRENT_TIMESTAMP(0) ON UPDATE CURRENT_TIMESTAMP(0)`);
        await queryRunner.query(`ALTER TABLE \`coupon_issued\` CHANGE \`issuedDt\` \`issuedDt\` datetime(0) NOT NULL COMMENT '쿠폰 발급정보 생성일시' DEFAULT CURRENT_TIMESTAMP(0)`);
        await queryRunner.query(`ALTER TABLE \`user\` CHANGE \`createdDt\` \`createdDt\` datetime(0) NOT NULL COMMENT '유저 데이터 생성일' DEFAULT CURRENT_TIMESTAMP(0)`);
        await queryRunner.query(`ALTER TABLE \`user\` CHANGE \`updatedDt\` \`updatedDt\` datetime(0) NULL COMMENT '유저 데이터 수정일' DEFAULT CURRENT_TIMESTAMP(0) ON UPDATE CURRENT_TIMESTAMP(0)`);
        await queryRunner.query(`ALTER TABLE \`coupon_issued_log\` CHANGE \`createdDt\` \`createdDt\` datetime(0) NOT NULL COMMENT '쿠폰 로그 생성일시' DEFAULT CURRENT_TIMESTAMP(0)`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`coupon_issued_log\` CHANGE \`createdDt\` \`createdDt\` datetime(0) NOT NULL COMMENT '쿠폰 로그 생성일시' DEFAULT CURRENT_TIMESTAMP`);
        await queryRunner.query(`ALTER TABLE \`user\` CHANGE \`updatedDt\` \`updatedDt\` datetime(0) NULL COMMENT '유저 데이터 수정일' DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP`);
        await queryRunner.query(`ALTER TABLE \`user\` CHANGE \`createdDt\` \`createdDt\` datetime(0) NOT NULL COMMENT '유저 데이터 생성일' DEFAULT CURRENT_TIMESTAMP`);
        await queryRunner.query(`ALTER TABLE \`coupon_issued\` CHANGE \`issuedDt\` \`issuedDt\` datetime(0) NOT NULL COMMENT '쿠폰 발급정보 생성일시' DEFAULT CURRENT_TIMESTAMP`);
        await queryRunner.query(`ALTER TABLE \`coupon\` CHANGE \`updatedDt\` \`updatedDt\` datetime(0) NULL COMMENT '쿠폰 정보 수정일시' DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP`);
        await queryRunner.query(`ALTER TABLE \`coupon\` CHANGE \`createdDt\` \`createdDt\` datetime(0) NOT NULL COMMENT '쿠폰 정보 생성일시' DEFAULT CURRENT_TIMESTAMP`);
        await queryRunner.query(`ALTER TABLE \`post\` CHANGE \`deletedDt\` \`deletedDt\` datetime(0) NOT NULL COMMENT '게시글 데이터 삭제일' DEFAULT CURRENT_TIMESTAMP`);
        await queryRunner.query(`ALTER TABLE \`post\` CHANGE \`updatedDt\` \`updatedDt\` datetime(0) NOT NULL COMMENT '게시글 데이터 수정일' DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP`);
        await queryRunner.query(`ALTER TABLE \`post\` CHANGE \`createdDt\` \`createdDt\` datetime(0) NOT NULL COMMENT '게시글 데이터 생성일' DEFAULT CURRENT_TIMESTAMP`);
        await queryRunner.query(`CREATE INDEX \`post_user_FK\` ON \`post\` (\`userUuid\`)`);
    }

}
