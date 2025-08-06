import { IsArray, IsEnum, IsNotEmpty, IsString } from "class-validator";
import { SessionType } from "src/entities/DoctorAvailability.entity";

import { WeekDay } from "src/entities/WeekDay.enum";

export class CreateDoctorAvailabilityDTO{

    @IsArray()
    @IsEnum(WeekDay, {each:true})
    @IsNotEmpty({each: true})
    days_of_week: WeekDay[];    // Days doctor is available

    @IsEnum(SessionType)
    session:SessionType;        // Morning or Evening

    @IsString()
    start_time: string;         // Start time ('09:00')

    @IsString()
    end_time: string;           // End time ('12:00')
}