import { MigrationInterface, QueryRunner } from "typeorm";

export class RemovingComplainFieldFromAppointmentTableMigration1753706669890 implements MigrationInterface {
    name = 'RemovingComplainFieldFromAppointmentTableMigration1753706669890'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "doctors" DROP COLUMN "time_slot"`);
        await queryRunner.query(`ALTER TABLE "appointments" DROP COLUMN "complaint"`);
        await queryRunner.query(`ALTER TABLE "appointments" DROP COLUMN "complaint_details"`);
        await queryRunner.query(`ALTER TABLE "appointments" ADD CONSTRAINT "UQ_a7641250a012bfaf3838869d1e7" UNIQUE ("patient_id", "doctor_id", "time_slot_id", "status")`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "appointments" DROP CONSTRAINT "UQ_a7641250a012bfaf3838869d1e7"`);
        await queryRunner.query(`ALTER TABLE "appointments" ADD "complaint_details" character varying`);
        await queryRunner.query(`ALTER TABLE "appointments" ADD "complaint" character varying NOT NULL`);
        await queryRunner.query(`ALTER TABLE "doctors" ADD "time_slot" text array NOT NULL`);
    }

}
