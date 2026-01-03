import { MigrationInterface, QueryRunner } from "typeorm";

export class AddChatTables202601041767453613376 implements MigrationInterface {
    name = 'AddChatTables202601041767453613376'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE \`chat_room_member\` (\`id\` int UNSIGNED NOT NULL AUTO_INCREMENT COMMENT '채팅 멤버 고유 번호', \`roomId\` int UNSIGNED NOT NULL COMMENT '채팅 고유 번호', \`displayName\` varchar(255) NULL COMMENT '사용자별 커스텀 방 제목', \`userUuid\` varchar(255) NOT NULL COMMENT '채팅에 참여한 회원 uuid', \`role\` enum ('ADMIN', 'OWNER', 'MEMBER') NOT NULL COMMENT '채팅 참여 권한' DEFAULT 'MEMBER', \`isReadHistory\` tinyint(1) NOT NULL COMMENT '과거 채팅 읽기 가능 허용 여부' DEFAULT '0', \`historyReadableDt\` datetime(0) NULL COMMENT '과거 채팅 읽기 가능 여부 기준 시간', \`lastReadMessageId\` int UNSIGNED NULL COMMENT '마지막에 읽은 메시지 id', \`lastReadDt\` datetime(0) NULL COMMENT '메시지 마지막 읽은 시점', \`joinedDt\` datetime(0) NOT NULL COMMENT '채팅 참여 일시' DEFAULT CURRENT_TIMESTAMP(0), \`leftDt\` datetime(0) NULL COMMENT '채팅 나감 일시', INDEX \`idx_user\` (\`userUuid\`), INDEX \`idx_room\` (\`roomId\`), UNIQUE INDEX \`uq_room_user\` (\`roomId\`, \`userUuid\`), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`chat_message_read\` (\`id\` int UNSIGNED NOT NULL AUTO_INCREMENT COMMENT '메시지 읽음 고유 번호', \`messageId\` int UNSIGNED NOT NULL COMMENT '메시지 고유 번호', \`userUuid\` varchar(255) NOT NULL COMMENT '사용자의 uuid', \`readDt\` datetime(0) NOT NULL COMMENT '읽은 시간' DEFAULT CURRENT_TIMESTAMP(0), INDEX \`idx_user\` (\`userUuid\`), INDEX \`idx_message\` (\`messageId\`), UNIQUE INDEX \`uq_message_user\` (\`messageId\`, \`userUuid\`), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`chat_message\` (\`id\` int UNSIGNED NOT NULL AUTO_INCREMENT COMMENT '채팅 메시지 고유 번호', \`roomId\` int UNSIGNED NOT NULL COMMENT '채팅 고유 번호', \`content\` text NULL COMMENT '채팅 내용', \`senderUserUuid\` varchar(255) NOT NULL COMMENT '보낸 사람 uuid', \`createdDt\` datetime(0) NOT NULL COMMENT '채팅 메시지 생성 시간' DEFAULT CURRENT_TIMESTAMP(0), INDEX \`idx_room_id\` (\`roomId\`, \`id\`), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`chat_room\` (\`id\` int UNSIGNED NOT NULL AUTO_INCREMENT COMMENT '채팅 고유 번호', \`roomType\` enum ('DM', 'GROUP') NOT NULL COMMENT '채팅 방식(1:1 또는 그룹채팅)', \`name\` varchar(255) NULL COMMENT '채팅방 이름', \`memberCount\` int UNSIGNED NOT NULL COMMENT '채팅 참여 인원 수', \`createdDt\` datetime(0) NOT NULL COMMENT '채팅 생성 시간' DEFAULT CURRENT_TIMESTAMP(0), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
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
        await queryRunner.query(`ALTER TABLE \`chat_room_member\` ADD CONSTRAINT \`FK_05fc1eeba27413b8c415a62408d\` FOREIGN KEY (\`roomId\`) REFERENCES \`chat_room\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`chat_message_read\` ADD CONSTRAINT \`FK_c81c0d05227b14085e85e333aa6\` FOREIGN KEY (\`messageId\`) REFERENCES \`chat_message\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`chat_message\` ADD CONSTRAINT \`FK_55dfd6d1589749727a7ef2d121f\` FOREIGN KEY (\`roomId\`) REFERENCES \`chat_room\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`chat_message\` DROP FOREIGN KEY \`FK_55dfd6d1589749727a7ef2d121f\``);
        await queryRunner.query(`ALTER TABLE \`chat_message_read\` DROP FOREIGN KEY \`FK_c81c0d05227b14085e85e333aa6\``);
        await queryRunner.query(`ALTER TABLE \`chat_room_member\` DROP FOREIGN KEY \`FK_05fc1eeba27413b8c415a62408d\``);
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
        await queryRunner.query(`DROP TABLE \`chat_room\``);
        await queryRunner.query(`DROP INDEX \`idx_room_id\` ON \`chat_message\``);
        await queryRunner.query(`DROP TABLE \`chat_message\``);
        await queryRunner.query(`DROP INDEX \`uq_message_user\` ON \`chat_message_read\``);
        await queryRunner.query(`DROP INDEX \`idx_message\` ON \`chat_message_read\``);
        await queryRunner.query(`DROP INDEX \`idx_user\` ON \`chat_message_read\``);
        await queryRunner.query(`DROP TABLE \`chat_message_read\``);
        await queryRunner.query(`DROP INDEX \`uq_room_user\` ON \`chat_room_member\``);
        await queryRunner.query(`DROP INDEX \`idx_room\` ON \`chat_room_member\``);
        await queryRunner.query(`DROP INDEX \`idx_user\` ON \`chat_room_member\``);
        await queryRunner.query(`DROP TABLE \`chat_room_member\``);
    }

}
