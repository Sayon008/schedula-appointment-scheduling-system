import { MigrationInterface, QueryRunner } from "typeorm";

export class AddedTimeSlotExpiryColumnInAppointment1754059524484 implements MigrationInterface {
    name = 'AddedTimeSlotExpiryColumnInAppointment1754059524484'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "appointments" ADD "suggested_slot_expiry" TIMESTAMP`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "appointments" DROP COLUMN "suggested_slot_expiry"`);
    }

}
