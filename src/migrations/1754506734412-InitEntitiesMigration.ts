import { MigrationInterface, QueryRunner } from "typeorm";

export class InitEntitiesMigration1754506734412 implements MigrationInterface {
    name = 'InitEntitiesMigration1754506734412'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TYPE "public"."doctor_time_slot_weekday_enum" AS ENUM('Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday')`);
        await queryRunner.query(`CREATE TABLE "doctor_time_slot" ("id" SERIAL NOT NULL, "date" date NOT NULL, "weekday" "public"."doctor_time_slot_weekday_enum" NOT NULL, "booked_count" integer NOT NULL DEFAULT '0', "max_booking" integer NOT NULL DEFAULT '1', "start_time" TIME NOT NULL, "end_time" TIME NOT NULL, "is_available" boolean NOT NULL DEFAULT true, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "availability_id" integer, CONSTRAINT "PK_ade5a566b70f84fa28dc289c12a" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TYPE "public"."doctor_availability_session_enum" AS ENUM('morning', 'evening')`);
        await queryRunner.query(`CREATE TYPE "public"."doctor_availability_days_of_week_enum" AS ENUM('Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday')`);
        await queryRunner.query(`CREATE TABLE "doctor_availability" ("id" SERIAL NOT NULL, "session" "public"."doctor_availability_session_enum", "start_time" TIME NOT NULL, "end_time" TIME NOT NULL, "days_of_week" "public"."doctor_availability_days_of_week_enum" array NOT NULL, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "doctor_id" integer, CONSTRAINT "PK_3d2b4ffe9085f8c7f9f269aed89" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TYPE "public"."doctors_specialization_enum" AS ENUM('Cardiology', 'Dermatology', 'Endocrinology', 'Gastroenterology', 'General Medicine', 'Gynecology', 'Neurology', 'Oncology', 'Orthopedics', 'Pediatrics', 'Psychiatry', 'Pulmonology', 'Radiology', 'Surgery', 'Urology')`);
        await queryRunner.query(`CREATE TABLE "doctors" ("doctor_id" SERIAL NOT NULL, "specialization" "public"."doctors_specialization_enum" NOT NULL, "years_of_exp" integer NOT NULL, "user_id" integer, CONSTRAINT "REL_653c27d1b10652eb0c7bbbc442" UNIQUE ("user_id"), CONSTRAINT "PK_24821d9468276ddc40107fc0819" PRIMARY KEY ("doctor_id"))`);
        await queryRunner.query(`CREATE TYPE "public"."appointments_weekday_enum" AS ENUM('Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday')`);
        await queryRunner.query(`CREATE TYPE "public"."appointments_status_enum" AS ENUM('scheduled', 'confirmed', 'completed', 'cancelled_by_patient', 'cancelled_by_doctor', 'recheduled', 'no_show', 'pending_doctor_availability_change', 'pending')`);
        await queryRunner.query(`CREATE TABLE "appointments" ("id" SERIAL NOT NULL, "appointment_time" TIMESTAMP WITH TIME ZONE NOT NULL, "weekday" "public"."appointments_weekday_enum" NOT NULL, "status" "public"."appointments_status_enum" NOT NULL, "chat" jsonb, "feedback" character varying, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "suggested_slot_expiry" TIMESTAMP, "doctor_id" integer NOT NULL, "patient_id" integer NOT NULL, "time_slot_id" integer NOT NULL, CONSTRAINT "UQ_a7641250a012bfaf3838869d1e7" UNIQUE ("patient_id", "doctor_id", "time_slot_id", "status"), CONSTRAINT "PK_4a437a9a27e948726b8bb3e36ad" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TYPE "public"."patients_sex_enum" AS ENUM('male', 'female', 'other')`);
        await queryRunner.query(`CREATE TABLE "patients" ("patient_id" SERIAL NOT NULL, "phone_number" character varying(10), "age" integer, "sex" "public"."patients_sex_enum", "weight" integer, "user_id" integer, CONSTRAINT "REL_7fe1518dc780fd777669b5cb7a" UNIQUE ("user_id"), CONSTRAINT "PK_1dc2db3a63a0bf2388fbfee86b1" PRIMARY KEY ("patient_id"))`);
        await queryRunner.query(`CREATE TYPE "public"."users_role_enum" AS ENUM('doctor', 'patient')`);
        await queryRunner.query(`CREATE TABLE "users" ("user_id" SERIAL NOT NULL, "email" character varying NOT NULL, "password" character varying NOT NULL, "first_name" character varying NOT NULL, "last_name" character varying NOT NULL, "profile_photo" text, "role" "public"."users_role_enum" NOT NULL, CONSTRAINT "UQ_97672ac88f789774dd47f7c8be3" UNIQUE ("email"), CONSTRAINT "PK_96aac72f1574b88752e9fb00089" PRIMARY KEY ("user_id"))`);
        await queryRunner.query(`ALTER TABLE "doctor_time_slot" ADD CONSTRAINT "FK_53d14be294f740ffde89940fafc" FOREIGN KEY ("availability_id") REFERENCES "doctor_availability"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "doctor_availability" ADD CONSTRAINT "FK_2cc8d37cdcb4ecd1e726d6ed304" FOREIGN KEY ("doctor_id") REFERENCES "doctors"("doctor_id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "doctors" ADD CONSTRAINT "FK_653c27d1b10652eb0c7bbbc4427" FOREIGN KEY ("user_id") REFERENCES "users"("user_id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "appointments" ADD CONSTRAINT "FK_4cf26c3f972d014df5c68d503d2" FOREIGN KEY ("doctor_id") REFERENCES "doctors"("doctor_id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "appointments" ADD CONSTRAINT "FK_3330f054416745deaa2cc130700" FOREIGN KEY ("patient_id") REFERENCES "patients"("patient_id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "appointments" ADD CONSTRAINT "FK_5019db00ff2d18f536272643b45" FOREIGN KEY ("time_slot_id") REFERENCES "doctor_time_slot"("id") ON DELETE RESTRICT ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "patients" ADD CONSTRAINT "FK_7fe1518dc780fd777669b5cb7a0" FOREIGN KEY ("user_id") REFERENCES "users"("user_id") ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "patients" DROP CONSTRAINT "FK_7fe1518dc780fd777669b5cb7a0"`);
        await queryRunner.query(`ALTER TABLE "appointments" DROP CONSTRAINT "FK_5019db00ff2d18f536272643b45"`);
        await queryRunner.query(`ALTER TABLE "appointments" DROP CONSTRAINT "FK_3330f054416745deaa2cc130700"`);
        await queryRunner.query(`ALTER TABLE "appointments" DROP CONSTRAINT "FK_4cf26c3f972d014df5c68d503d2"`);
        await queryRunner.query(`ALTER TABLE "doctors" DROP CONSTRAINT "FK_653c27d1b10652eb0c7bbbc4427"`);
        await queryRunner.query(`ALTER TABLE "doctor_availability" DROP CONSTRAINT "FK_2cc8d37cdcb4ecd1e726d6ed304"`);
        await queryRunner.query(`ALTER TABLE "doctor_time_slot" DROP CONSTRAINT "FK_53d14be294f740ffde89940fafc"`);
        await queryRunner.query(`DROP TABLE "users"`);
        await queryRunner.query(`DROP TYPE "public"."users_role_enum"`);
        await queryRunner.query(`DROP TABLE "patients"`);
        await queryRunner.query(`DROP TYPE "public"."patients_sex_enum"`);
        await queryRunner.query(`DROP TABLE "appointments"`);
        await queryRunner.query(`DROP TYPE "public"."appointments_status_enum"`);
        await queryRunner.query(`DROP TYPE "public"."appointments_weekday_enum"`);
        await queryRunner.query(`DROP TABLE "doctors"`);
        await queryRunner.query(`DROP TYPE "public"."doctors_specialization_enum"`);
        await queryRunner.query(`DROP TABLE "doctor_availability"`);
        await queryRunner.query(`DROP TYPE "public"."doctor_availability_days_of_week_enum"`);
        await queryRunner.query(`DROP TYPE "public"."doctor_availability_session_enum"`);
        await queryRunner.query(`DROP TABLE "doctor_time_slot"`);
        await queryRunner.query(`DROP TYPE "public"."doctor_time_slot_weekday_enum"`);
    }

}
