import { IsBoolean, IsDateString, IsEnum, IsInt, IsNotEmpty, IsOptional, IsString, Min } from "class-validator";
import { WeekDay } from "src/entities/WeekDay.enum";

export class CreateDoctorTimeSlotDTO{

    @IsNotEmpty()
    @IsDateString({strict:true})
    date:string;

    @IsEnum(WeekDay)
    weekDay: WeekDay;

    @IsNotEmpty()
    @IsString()
    start_time:string;

    @IsNotEmpty()
    @IsString()
    end_time:string;

    @IsOptional()
    @IsInt()
    @Min(1)
    max_booking?:number;

    @IsOptional()
    @IsInt()
    @Min(0)
    booked_count?:number;

    @IsOptional()
    @IsBoolean()
    is_available?:boolean
}