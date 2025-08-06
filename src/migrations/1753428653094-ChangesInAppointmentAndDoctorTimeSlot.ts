import { MigrationInterface, QueryRunner } from "typeorm";

export class ChangesInAppointmentAndDoctorTimeSlot1753428653094 implements MigrationInterface {
    name = 'ChangesInAppointmentAndDoctorTimeSlot1753428653094'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "appointments" DROP CONSTRAINT "FK_4cad0265e6f4930b7802676eb35"`);
        await queryRunner.query(`ALTER TABLE "appointments" DROP CONSTRAINT "FK_669db51cd07b8a65bee9aaf9c4a"`);
        await queryRunner.query(`ALTER TABLE "appointments" DROP CONSTRAINT "FK_1b351bdfbd715acbd0619199676"`);
        await queryRunner.query(`ALTER TABLE "appointments" DROP COLUMN "status"`);
        await queryRunner.query(`DROP TYPE IF EXISTS "public"."appointments_status_enum"`);
        await queryRunner.query(`ALTER TABLE "appointments" DROP COLUMN "doctorDoctorId"`);
        await queryRunner.query(`ALTER TABLE "appointments" DROP COLUMN "patientPatientId"`);
        await queryRunner.query(`ALTER TABLE "appointments" DROP COLUMN "timeSlotId"`);
        await queryRunner.query(`ALTER TABLE "appointments" ADD "doctorDoctorId" integer NOT NULL`);
        await queryRunner.query(`ALTER TABLE "appointments" ADD "patientPatientId" integer NOT NULL`);
        await queryRunner.query(`ALTER TABLE "appointments" ADD "timeSlotId" integer NOT NULL`);
        await queryRunner.query(`ALTER TABLE "appointments" ADD "appointment_time" TIMESTAMP WITH TIME ZONE NOT NULL`);
        await queryRunner.query(`
        CREATE TYPE "public"."appointments_status_enum" AS ENUM(
            'scheduled',
            'confirmed',
            'completed',
            'cancelled_by_patient',
            'cancelled_by_doctor',
            'recheduled',
            'no_show',
            'pending'
        )
    `);
        await queryRunner.query(`ALTER TABLE "appointments" ADD "status" "public"."appointments_status_enum" NOT NULL`);
        await queryRunner.query(`ALTER TABLE "appointments" ADD "doctor_id" integer NOT NULL`);
        await queryRunner.query(`ALTER TABLE "appointments" ADD "patient_id" integer NOT NULL`);
        await queryRunner.query(`ALTER TABLE "appointments" ADD "time_slot_id" integer NOT NULL`);
        await queryRunner.query(`ALTER TABLE "appointments" ALTER COLUMN "weekday" SET NOT NULL`);
        await queryRunner.query(`ALTER TABLE "appointments" ADD CONSTRAINT "FK_4cad0265e6f4930b7802676eb35" FOREIGN KEY ("doctorDoctorId") REFERENCES "doctors"("doctor_id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "appointments" ADD CONSTRAINT "FK_669db51cd07b8a65bee9aaf9c4a" FOREIGN KEY ("patientPatientId") REFERENCES "patients"("patient_id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "appointments" ADD CONSTRAINT "FK_1b351bdfbd715acbd0619199676" FOREIGN KEY ("timeSlotId") REFERENCES "doctor_time_slot"("id") ON DELETE RESTRICT ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "appointments" ADD CONSTRAINT "FK_4cf26c3f972d014df5c68d503d2" FOREIGN KEY ("doctor_id") REFERENCES "doctors"("doctor_id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "appointments" ADD CONSTRAINT "FK_3330f054416745deaa2cc130700" FOREIGN KEY ("patient_id") REFERENCES "patients"("patient_id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "appointments" ADD CONSTRAINT "FK_5019db00ff2d18f536272643b45" FOREIGN KEY ("time_slot_id") REFERENCES "doctor_time_slot"("id") ON DELETE RESTRICT ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "appointments" DROP CONSTRAINT "FK_5019db00ff2d18f536272643b45"`);
        await queryRunner.query(`ALTER TABLE "appointments" DROP CONSTRAINT "FK_3330f054416745deaa2cc130700"`);
        await queryRunner.query(`ALTER TABLE "appointments" DROP CONSTRAINT "FK_4cf26c3f972d014df5c68d503d2"`);
        await queryRunner.query(`ALTER TABLE "appointments" DROP CONSTRAINT "FK_1b351bdfbd715acbd0619199676"`);
        await queryRunner.query(`ALTER TABLE "appointments" DROP CONSTRAINT "FK_669db51cd07b8a65bee9aaf9c4a"`);
        await queryRunner.query(`ALTER TABLE "appointments" DROP CONSTRAINT "FK_4cad0265e6f4930b7802676eb35"`);
        await queryRunner.query(`ALTER TABLE "appointments" ALTER COLUMN "weekday" DROP NOT NULL`);
        await queryRunner.query(`ALTER TABLE "appointments" DROP COLUMN "time_slot_id"`);
        await queryRunner.query(`ALTER TABLE "appointments" DROP COLUMN "patient_id"`);
        await queryRunner.query(`ALTER TABLE "appointments" DROP COLUMN "doctor_id"`);
        await queryRunner.query(`ALTER TABLE "appointments" DROP COLUMN "status"`);
        await queryRunner.query(`ALTER TABLE "appointments" DROP COLUMN "appointment_time"`);
        await queryRunner.query(`ALTER TABLE "appointments" DROP COLUMN "timeSlotId"`);
        await queryRunner.query(`ALTER TABLE "appointments" DROP COLUMN "patientPatientId"`);
        await queryRunner.query(`ALTER TABLE "appointments" DROP COLUMN "doctorDoctorId"`);
        await queryRunner.query(`ALTER TABLE "appointments" ADD "timeSlotId" integer NOT NULL`);
        await queryRunner.query(`ALTER TABLE "appointments" ADD "patientPatientId" integer NOT NULL`);
        await queryRunner.query(`ALTER TABLE "appointments" ADD "doctorDoctorId" integer NOT NULL`);
        await queryRunner.query(`CREATE TYPE "public"."appointments_status_enum" AS ENUM('scheduled', 'confirmed', 'completed', 'cancelled', 'no_show')`);
        await queryRunner.query(`ALTER TABLE "appointments" ADD "status" "public"."appointments_status_enum" NOT NULL`);
        await queryRunner.query(`ALTER TABLE "appointments" ADD CONSTRAINT "FK_1b351bdfbd715acbd0619199676" FOREIGN KEY ("timeSlotId") REFERENCES "doctor_time_slot"("id") ON DELETE RESTRICT ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "appointments" ADD CONSTRAINT "FK_669db51cd07b8a65bee9aaf9c4a" FOREIGN KEY ("patientPatientId") REFERENCES "patients"("patient_id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "appointments" ADD CONSTRAINT "FK_4cad0265e6f4930b7802676eb35" FOREIGN KEY ("doctorDoctorId") REFERENCES "doctors"("doctor_id") ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

}
