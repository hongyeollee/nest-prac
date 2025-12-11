/* eslint-disable prettier/prettier */
import { MigrationInterface, QueryRunner } from "typeorm";

export class AddPostLikeTableAndUpdatePostTableColumn202512081765435338231 implements MigrationInterface {
    name = 'AddPostLikeTableAndUpdatePostTableColumn202512081765435338231'

    public async up(queryRunner: QueryRunner): Promise<void> {
        // await queryRunner.query(`DROP INDEX \`post_user_FK\` ON \`post\``);
        await queryRunner.query(`ALTER TABLE \`post\` CHANGE \`id\` \`id\` int UNSIGNED NOT NULL AUTO_INCREMENT COMMENT '게시판의 고유 번호'`);
        await queryRunner.query(`ALTER TABLE \`post\` CHANGE \`createdDt\` \`createdDt\` datetime(0) NOT NULL COMMENT '게시글 데이터 생성일' DEFAULT CURRENT_TIMESTAMP(0)`);
        await queryRunner.query(`ALTER TABLE \`post\` CHANGE \`updatedDt\` \`updatedDt\` datetime(0) NULL COMMENT '게시글 데이터 수정일' DEFAULT CURRENT_TIMESTAMP(0) ON UPDATE CURRENT_TIMESTAMP(0)`);
        await queryRunner.query(`ALTER TABLE \`coupon\` CHANGE \`createdDt\` \`createdDt\` datetime(0) NOT NULL COMMENT '쿠폰 정보 생성일시' DEFAULT CURRENT_TIMESTAMP(0)`);
        await queryRunner.query(`ALTER TABLE \`coupon\` CHANGE \`updatedDt\` \`updatedDt\` datetime(0) NULL COMMENT '쿠폰 정보 수정일시' DEFAULT CURRENT_TIMESTAMP(0) ON UPDATE CURRENT_TIMESTAMP(0)`);
        await queryRunner.query(`ALTER TABLE \`coupon_issued\` CHANGE \`issuedDt\` \`issuedDt\` datetime(0) NOT NULL COMMENT '쿠폰 발급정보 생성일시' DEFAULT CURRENT_TIMESTAMP(0)`);
        await queryRunner.query(`ALTER TABLE \`user\` CHANGE \`createdDt\` \`createdDt\` datetime(0) NOT NULL COMMENT '유저 데이터 생성일' DEFAULT CURRENT_TIMESTAMP(0)`);
        await queryRunner.query(`ALTER TABLE \`user\` CHANGE \`updatedDt\` \`updatedDt\` datetime(0) NULL COMMENT '유저 데이터 수정일' DEFAULT CURRENT_TIMESTAMP(0) ON UPDATE CURRENT_TIMESTAMP(0)`);
        await queryRunner.query(`ALTER TABLE \`coupon_issued_log\` CHANGE \`createdDt\` \`createdDt\` datetime(0) NOT NULL COMMENT '쿠폰 로그 생성일시' DEFAULT CURRENT_TIMESTAMP(0)`);
        await queryRunner.query(`ALTER TABLE \`post_like\` CHANGE \`createdDt\` \`createdDt\` datetime(0) NOT NULL COMMENT '생성일' DEFAULT CURRENT_TIMESTAMP(0)`);
        await queryRunner.query(`ALTER TABLE \`post_like\` CHANGE \`actionDt\` \`actionDt\` datetime(0) NULL COMMENT '마지막 좋아요 또는 좋아요 해지 일시' DEFAULT CURRENT_TIMESTAMP(0)`);
        await queryRunner.query(`ALTER TABLE \`post_like\` ADD CONSTRAINT \`FK_789b3f929eb3d8760419f87c8a9\` FOREIGN KEY (\`postId\`) REFERENCES \`post\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`post_like\` DROP FOREIGN KEY \`FK_789b3f929eb3d8760419f87c8a9\``);
        await queryRunner.query(`ALTER TABLE \`post_like\` CHANGE \`actionDt\` \`actionDt\` datetime(0) NULL COMMENT '마지막 좋아요 또는 좋아요 해지 일시' DEFAULT CURRENT_TIMESTAMP`);
        await queryRunner.query(`ALTER TABLE \`post_like\` CHANGE \`createdDt\` \`createdDt\` datetime(0) NOT NULL COMMENT '생성일' DEFAULT CURRENT_TIMESTAMP`);
        await queryRunner.query(`ALTER TABLE \`coupon_issued_log\` CHANGE \`createdDt\` \`createdDt\` datetime(0) NOT NULL COMMENT '쿠폰 로그 생성일시' DEFAULT CURRENT_TIMESTAMP`);
        await queryRunner.query(`ALTER TABLE \`user\` CHANGE \`updatedDt\` \`updatedDt\` datetime(0) NULL COMMENT '유저 데이터 수정일' DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP`);
        await queryRunner.query(`ALTER TABLE \`user\` CHANGE \`createdDt\` \`createdDt\` datetime(0) NOT NULL COMMENT '유저 데이터 생성일' DEFAULT CURRENT_TIMESTAMP`);
        await queryRunner.query(`ALTER TABLE \`coupon_issued\` CHANGE \`issuedDt\` \`issuedDt\` datetime(0) NOT NULL COMMENT '쿠폰 발급정보 생성일시' DEFAULT CURRENT_TIMESTAMP`);
        await queryRunner.query(`ALTER TABLE \`coupon\` CHANGE \`updatedDt\` \`updatedDt\` datetime(0) NULL COMMENT '쿠폰 정보 수정일시' DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP`);
        await queryRunner.query(`ALTER TABLE \`coupon\` CHANGE \`createdDt\` \`createdDt\` datetime(0) NOT NULL COMMENT '쿠폰 정보 생성일시' DEFAULT CURRENT_TIMESTAMP`);
        await queryRunner.query(`ALTER TABLE \`post\` CHANGE \`updatedDt\` \`updatedDt\` datetime(0) NULL COMMENT '게시글 데이터 수정일' DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP`);
        await queryRunner.query(`ALTER TABLE \`post\` CHANGE \`createdDt\` \`createdDt\` datetime(0) NOT NULL COMMENT '게시글 데이터 생성일' DEFAULT CURRENT_TIMESTAMP`);
        await queryRunner.query(`ALTER TABLE \`post\` CHANGE \`id\` \`id\` int NOT NULL AUTO_INCREMENT COMMENT '게시판의 고유 번호'`);
        // await queryRunner.query(`CREATE INDEX \`post_user_FK\` ON \`post\` (\`userUuid\`)`);
    }

}
