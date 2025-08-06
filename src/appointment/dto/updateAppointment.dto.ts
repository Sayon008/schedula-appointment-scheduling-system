import { IsDateString, IsEnum, IsOptional, IsString } from "class-validator";
import { AppointmentStatus } from "../entity/AppointmentStatus.enum";

export class UpdateAppointmentDTO{

    @IsOptional()
    @IsDateString()
    appointment_time?:string;

    @IsOptional()
    @IsEnum(AppointmentStatus)
    status?:AppointmentStatus;

    @IsOptional()
    @IsString()
    feedback: string
}