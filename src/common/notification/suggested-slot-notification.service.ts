import { Injectable, Logger } from "@nestjs/common";
import * as moment from "moment";
import { Appointment } from "src/appointment/entity/Appointment.entity";
import { DoctorAvailability } from "src/entities/DoctorAvailability.entity";
import { DoctorTimeSlot } from "src/entities/DoctorTimeSlot.entity";

@Injectable()
export class SuggestedSlotNotificationService{

    private readonly logger = new Logger(SuggestedSlotNotificationService.name);

    async sendSuggestedSlotNotification(
        appointment : Appointment,
        suggestedSlot : DoctorTimeSlot | null,
        availability : DoctorAvailability,
        newStartTime:string,
        newEndTime:string
    ): Promise<string>{
        const patient = appointment.patient.user;
        const doctor = appointment.doctor.user;
        const doctorName = doctor? `${doctor.first_name} ${doctor.last_name}` : 'unknown doctor';
        const doctorId = availability.doctor ? availability.doctor.doctor_id : null;
        
        if(suggestedSlot){
            return `Dear ${patient.first_name},

            Due to a change in Dr. ${doctorName}'s schedule, your original appointment on ${moment(appointment.appointment_time).format('YYYY-MM-DD HH:mm')} is no longer available.

            **Option 1: Accept the suggested slot**
            - Date: ${suggestedSlot.date}
            - Time: ${suggestedSlot.start_time}
            [Accept this slot](http://localhost:3000/appointments/${appointment.id}/accept-suggested-slot)
            [Body] : slotId=${suggestedSlot.id}

            **Option 2: Pick a new slot**
            [View and book another slot]
            View Slots By Availability Id - http://localhost:3000/doctor-timeslot/availability/${availability.id}
            View Slots By Doctor Id - http://localhost:3000/doctor-timeslot/availability/${doctorId}
            Book another slot - http://localhost:3000/appointments

            Please respond as soon as possible to secure your preferred time.

            If you do not respond within 1 hour, your appointment will be cancelled and you will need to book a new slot.

            Thank you!`;
        } 
        else 
        {
            return `Dear ${patient.first_name},

            Due to a change in Dr. ${doctorName}'s schedule, your original appointment on ${moment(appointment.appointment_time).format('YYYY-MM-DD HH:mm')} is no longer available.

            The Doctor's new available time window is from ${newStartTime} to ${newEndTime}.

            Currently, there are no available slots. Please [book a new appointment](http://localhost:3000/appointments) at your convenience.

            Thank you!`;
        }
    }


}