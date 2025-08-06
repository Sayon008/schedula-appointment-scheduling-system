import { IsBoolean, IsDateString, IsEnum, IsInt, IsNotEmpty, IsOptional, IsString } from "class-validator";
import { WeekDay } from "src/entities/WeekDay.enum";

export class UpdateDoctorTimeSlotDTO{

    @IsOptional()
    @IsDateString()
    date?:string;

    @IsOptional()
    @IsEnum(WeekDay)
    weekDay? : WeekDay;

    @IsOptional()
    @IsString()
    start_time: string;

    @IsOptional()
    @IsString()
    end_time : string;

    @IsOptional()
    @IsInt()
    max_booking : number;

    @IsOptional()
    @IsNotEmpty()
    is_availavle: boolean;
}