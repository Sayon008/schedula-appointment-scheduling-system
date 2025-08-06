import { Injectable, Logger } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import * as moment from "moment";
import { Appointment } from "src/appointment/entity/Appointment.entity";
import { AppointmentStatus } from "src/appointment/entity/AppointmentStatus.enum";
import { ScheduleAppointmentService } from "src/appointment/schedule-appointment.service";
import { NotificationService } from "src/common/notification/notification.service";
import { SuggestedSlotNotificationService } from "src/common/notification/suggested-slot-notification.service";
import { DoctorAvailability } from "src/entities/DoctorAvailability.entity";
import { DoctorTimeSlot } from "src/entities/DoctorTimeSlot.entity";
import { WeekDay } from "src/entities/WeekDay.enum";
import { EntityManager, Repository } from "typeorm";

@Injectable()
export class SchedulingConflictService{
    private readonly logger = new Logger(SchedulingConflictService.name);
    // Service methods for handling scheduling conflicts will be implemented here
    constructor(
        @InjectRepository(DoctorTimeSlot) private readonly doctorTimeSlotRepo: Repository<DoctorTimeSlot>,
        @InjectRepository(Appointment) private readonly appointmentRepo: Repository<Appointment>,

        private readonly schedulingAppointmentService: ScheduleAppointmentService,
        private readonly notificationService : NotificationService,
        private readonly suggestedSlotNotification : SuggestedSlotNotificationService,
    ){}

    

    async handleAvailabiltyConflict(
        oldAvailability: DoctorAvailability,
        newAvailability: DoctorAvailability,
        manager : EntityManager
    ){
        this.logger.log(`Handling availability conflict for doctor ${newAvailability.doctor.doctor_id}, Availability ID: ${newAvailability.id}`);

        const removedDays = oldAvailability.days_of_week.filter(day => !newAvailability.days_of_week.includes(day));
        const keptDays = newAvailability.days_of_week.filter(day => oldAvailability.days_of_week.includes(day));

        // Fecthing all the effected time slots
        const relevantTimeSlots = await manager.find(DoctorTimeSlot, {
            where : {
                availability : {id : newAvailability.id},
            },
            relations: ['appointments', 
                'appointments.patient', 
                'appointments.patient.user',
                'appointments.doctor',
                'appointments.doctor.user'
            ],
        });

        const affectedAppointments: Appointment[] = [];
        
        if(removedDays.length > 0){
            const slotsToRemove = relevantTimeSlots.filter(slot => keptDays.includes(slot.weekday as WeekDay));

            for(const slot of slotsToRemove){
                slot.is_available = false;
                await manager.save(slot);
                this.logger.log(`Marked slot ID ${slot.id} as unavailable due to removed days: ${removedDays.join(', ')}`);

                // Find the appointments in this time slots

                const activeAppointmnetsInRemovedList = slot.appointments.filter(
                    appointment =>
                    appointment.status === AppointmentStatus.SCHEDULED ||
                    appointment.status === AppointmentStatus.PENDING ||
                    appointment.status === AppointmentStatus.CONFIRMED
                );

                for(const appt of activeAppointmnetsInRemovedList){
                    appt.status = AppointmentStatus.PENDING_DOCTOR_AVAILABILITY_CHANGE;
                    appt.feedback = `Doctor's availability changed. Original slot (${slot.date} ${slot.start_time}-${slot.end_time}) on ${slot.weekday} is no longer available.`;
                    affectedAppointments.push(appt);

                    appt.suggested_slot_expiry = moment().add(1, 'hour').toDate();      //add 1 hour expiry for option 1

                    this.logger.log(`Appointment ID ${appt.id} is waiting for resolution due to availability change of Doctor${newAvailability.doctor.doctor_id}.`);
                }
            }

        }


        if(newAvailability.start_time !== oldAvailability.start_time || newAvailability.end_time !== oldAvailability.end_time){
            // If the time has changed, we need to update the time slots
            const slotToAdjust = relevantTimeSlots.filter(slot => keptDays.includes(slot.weekday as WeekDay));

            for(const slot of slotToAdjust){
                const slotStart = moment(`${slot.date} ${slot.start_time}`);
                const slotEnd = moment(`${slot.date} ${slot.end_time}`);

                const newAvailStart = moment(`${slot.date} ${newAvailability.start_time}`);
                const newAvailEnd = moment(`${slot.date} ${newAvailability.end_time}`);

                const isOutsideNewRange = slotStart.isBefore(newAvailStart) || slotEnd.isAfter(newAvailEnd);

                if(isOutsideNewRange){
                    this.logger.warn(`Slot ID ${slot.id} on ${slot.date} is outside the new availability range. Adjusting times.`);
                    slot.is_available = false; // Mark as unavailable
                    await manager.save(slot);


                    const activeAppointmentsInInvalidPart = slot.appointments.filter(appt =>
                        (appt.status === AppointmentStatus.SCHEDULED ||
                        appt.status === AppointmentStatus.PENDING ||
                        appt.status === AppointmentStatus.CONFIRMED) &&
                        (moment(appt.appointment_time).isBefore(newAvailStart) || moment(appt.appointment_time).isAfter(newAvailEnd))
                    );


                    for(const appt of activeAppointmentsInInvalidPart){
                        appt.status = AppointmentStatus.PENDING_DOCTOR_AVAILABILITY_CHANGE;
                        appt.feedback = `Doctor's availability changed. Original slot (${slot.date} ${slot.start_time}-${slot.end_time}) on ${slot.weekday} is no longer available.`;
                        affectedAppointments.push(appt);
                        appt.suggested_slot_expiry = moment().add(1, 'hour').toDate();      //add 1 hour expiry for option 1
                        this.logger.log(`Cancelled appointment ID ${appt.id} due to time change.`);
                    }
                }


                // For expanding the availability, we want to create *new* DoctorTimeSlots if they don't exist
                // TODO : Later Implementation
                
            }
        }

        // Save all the affected appointments within the same transaction
        await manager.save(affectedAppointments);


        // Notify the affected patients about the changes
        for(const appt of affectedAppointments){
            this.logger.log(`Notifying Patients ${appt.patient.user.email} about appointment ID ${appt.id} change.`);

            const patientEmial= appt.patient?.user?.email ?? 'unknown';
            const doctorName = appt.doctor.user ? appt.doctor.user.first_name +' '+ appt.doctor.user.last_name : 'unknown_doctor';


            const nearestSlot = await this.schedulingAppointmentService.findNearestAvailableSlot(appt.doctor.doctor_id, moment(appt.appointment_time), manager);
            
            let message : string = await this.suggestedSlotNotification.sendSuggestedSlotNotification(
                appt, 
                nearestSlot, 
                newAvailability,
                nearestSlot?.start_time ?? '',
                nearestSlot?.end_time ?? ''            
            );
            

            await this.notificationService.sendAppointmentChangeNotification(
                patientEmial,
                doctorName,
                message,
                appt.appointment_time,
                // newAvailability
            )
        }

    }
}
