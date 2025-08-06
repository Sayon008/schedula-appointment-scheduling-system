import { IsDateString, IsInt, isNotEmpty, IsNotEmpty, IsOptional, IsString } from "class-validator";

export class CreateAppointmentDTO{
    @IsNotEmpty()
    @IsInt()
    time_slot_id: number;

    @IsNotEmpty()
    @IsInt()
    patient_id: number;

    @IsNotEmpty()
    @IsInt()
    doctor_id:number;

    @IsNotEmpty()
    @IsDateString()
    appointment_time : string;

    // @IsNotEmpty()
    // @IsString()
    // complaint:string;

    // @IsOptional()
    // @IsString()
    // complaint_details:string;
}