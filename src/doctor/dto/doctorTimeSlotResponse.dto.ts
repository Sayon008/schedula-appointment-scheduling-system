import { WeekDay } from "src/entities/WeekDay.enum";

export class DoctorTimeSlotResponseDTO{
    date:string;
    weekday : WeekDay;
    start_time:string;
    end_time:string;
    is_available:boolean;
    id: number;
}