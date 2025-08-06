import { AppointmentStatus } from "../entity/AppointmentStatus.enum";

export class AppointmnetResponseDTO{
     id: number;
    appointment_time: Date;
    appointment_time_formatted?:string;
    status: AppointmentStatus;
    chat?: Record<string, any>;
    feedback?: string;
    doctor_info: {
        doctor_id: number;
        firstName: string;
        lastName: string;
        specialization: string;
        email: string;
    };
    patient_info: {
        patient_id: number;
        firstName: string;
        lastName: string;
        email: string;
        phone_number?: string;
    };
    time_slot_info: {
        id: number;
        date: string;
        start_time: string;
        end_time: string;
    };
}