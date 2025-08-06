import { InjectRepository } from "@nestjs/typeorm";
import { Appointment } from "./entity/Appointment.entity";
import { EntityManager, Repository } from "typeorm";
import { DoctorTimeSlot } from "src/entities/DoctorTimeSlot.entity";
import { BadRequestException, Logger, NotFoundException } from "@nestjs/common";
import { AppointmentStatus } from "./entity/AppointmentStatus.enum";
import * as moment from 'moment-timezone';
import { SuggestedSlotNotificationService } from "src/common/notification/suggested-slot-notification.service";
import { NotificationService } from "src/common/notification/notification.service";

export class ScheduleAppointmentService{
    private readonly logger = new Logger(ScheduleAppointmentService.name);

    constructor(
        @InjectRepository(Appointment) private readonly appointmentRepo: Repository<Appointment>,
        @InjectRepository(DoctorTimeSlot) private readonly timeSlotRepo: Repository<DoctorTimeSlot>,

        private readonly suggestedSlotNotification : SuggestedSlotNotificationService,
        private readonly notificationServie : NotificationService,
    ){}

    async findNearestAvailableSlot(doctorId: number, afterMoment: moment.Moment, manager: EntityManager):Promise<DoctorTimeSlot | null>{
            const potentialNearestSlot =  await manager.createQueryBuilder(DoctorTimeSlot, 'slot')
            .leftJoinAndSelect('slot.availability', 'availability')
            .where('slot.is_available = :isAvailable', {isAvailable:true})
            .andWhere('slot.booked_count < slot.max_booking')
            .andWhere('availability.doctor_id = :doctorId', {doctorId})
            .andWhere('slot.date >= :afterDate', {afterDate : afterMoment.format('YYYY-MM-DD')})
            .orderBy('slot.date', 'ASC')
            .addOrderBy('slot.start_time', 'ASC')
            .getMany();

            let nearestAvailableSlot: DoctorTimeSlot | null = null;

            // const now = moment().tz('Asia/Kolkata');

            for(const slot of potentialNearestSlot){
                const slotDateTime = moment(`${slot.date}T${slot.start_time}`).tz('Asia/Kolkata');

                if(slot.booked_count < slot.max_booking){
                    nearestAvailableSlot = slot;
                    break;
                }
            }

            return nearestAvailableSlot;
        }

    async acceptSuggestedSlot(appointmentId: number, slotId: number, newStartTime:string, newEndTime:string){
        const appt = await this.appointmentRepo.findOne({
            where : {id: appointmentId},
            relations:['timeSlot']
        });

        const slot = await this.timeSlotRepo.findOne({
            where : {id : slotId, is_available:true},
            relations:['appointments']
        });

        if(!slot || slot.booked_count === slot.max_booking || !slot.is_available){
            const apptFull = await this.appointmentRepo.findOne({
                where : {id : appointmentId},
                relations:['doctor', 'doctor.user', 'patient', 'patient.user', 'timeSlot', 'timeSlot.availability'],
            })

            if(!apptFull){
                throw new NotFoundException('Invalid Appointment Id');
            }

            // Find the next available slot
            const nextSlot = await this.findNearestAvailableSlot(
                apptFull.doctor.doctor_id,
                moment(apptFull.appointment_time),
                this.appointmentRepo.manager
            );

            if(nextSlot){
                // Reset the 1 hour expiry
                apptFull.suggested_slot_expiry = moment().add(1, 'hour').toDate();
                await this.appointmentRepo.save(apptFull);

                const patientEmial= apptFull.patient?.user?.email ?? 'unknown';
                const doctorName = apptFull.doctor.user ? apptFull.doctor.user.first_name +' '+ apptFull.doctor.user.last_name : 'unknown_doctor';

                let message = await this.suggestedSlotNotification.sendSuggestedSlotNotification(
                    apptFull, 
                    nextSlot, 
                    apptFull.timeSlot.availability,
                    newStartTime,
                    newEndTime
                );
                


                // Send the notification
                await this.notificationServie.sendAppointmentChangeNotification(
                    patientEmial,
                    doctorName,
                    message,
                    apptFull.appointment_time,
                )
            }

            throw new BadRequestException('Slot is Full and is not available anymore. A new slot suggestion has been sent to your email.');
        }

        if(!appt || !slot){
            throw new NotFoundException('Invalid Slot Id or Appointment Id');
        }


        // Check for if option 1 has expired or not
        if(appt.suggested_slot_expiry && new Date() > appt.suggested_slot_expiry){
            appt.status = AppointmentStatus.CANCELLED_BY_DOCTOR;
            appt.feedback = 'You did not accept the suggested slot in time. Please book a new appointment.';
            await this.appointmentRepo.save(appt);
            throw new BadRequestException('The time to accept the suggested slot has expired. Please book a new slot.');
        }


        const start = moment(`${slot.date}T${slot.start_time}`);
        const end = moment(`${slot.date}T${slot.end_time}`);

        const duration = end.diff(start, 'minutes') / slot.max_booking;


        const bookedTimes = slot.appointments
        .filter(a => a.status === AppointmentStatus.SCHEDULED)
        .map(a => moment(a.appointment_time).format('HH:mm'));


        let appointmentTime : moment.Moment | null = null;

        for(let i=0;i<slot.max_booking;i++){
            const candidate = start.clone().add(i * duration, 'minutes');

            if(!bookedTimes.includes(candidate.format('HH:mm'))){
                appointmentTime = candidate;
                break;
            }

        }

        if (!appointmentTime) throw new Error('No available time in slot');

        appt.timeSlot = slot;
        appt.appointment_time = appointmentTime.toDate();
        appt.status = AppointmentStatus.SCHEDULED;
        appt.feedback = `Your appointment has been rescheduled to (${slot.date} ${slot.start_time}-${slot.end_time}) on ${slot.weekday} as per your acceptance of the suggested slot.`
        slot.booked_count++;

        if(slot.booked_count >= slot.max_booking){
            slot.is_available = false;
        }

        await this.timeSlotRepo.save(slot);

        await this.appointmentRepo.save(appt);

        return { message: 'Appointment rescheduled to suggested slot.' };
    }


    async rescheduleAppointment(appointmentId: number, slotId: number) {
        const appt = await this.appointmentRepo.findOne({ where: { id: appointmentId } });
        if (!appt) throw new NotFoundException('Appointment not found');
        appt.status = AppointmentStatus.CANCELLED_BY_DOCTOR;
        appt.feedback = 'Cancelled due to doctor availability change';
        await this.appointmentRepo.save(appt);

        // Optionally, notify the patient here
        // await this.notificationService.sendAppointmentCancelledNotification(...);

        return { message: 'Appointment cancelled. Patient notified to book a new slot.' };
    }
}