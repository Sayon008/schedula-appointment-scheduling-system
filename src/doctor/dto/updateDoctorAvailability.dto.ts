import { IsArray, IsEnum, IsOptional, IsString } from "class-validator";
import { SessionType } from "src/entities/DoctorAvailability.entity";
import { WeekDay } from "src/entities/WeekDay.enum";


export class UpdateDoctorAvailabilityDTO{

    @IsOptional()
    @IsEnum(WeekDay, {each:true})
    @IsArray()
    days_of_week:WeekDay[];

    @IsOptional()
    @IsEnum(SessionType)
    session?:SessionType;

    @IsOptional()
    @IsString()
    start_time:string;


    @IsOptional()
    @IsString()
    end_time:string;
}