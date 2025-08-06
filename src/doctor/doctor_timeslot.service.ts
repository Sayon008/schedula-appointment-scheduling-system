import { BadRequestException, Injectable, Logger, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { DoctorAvailability } from "src/entities/DoctorAvailability.entity";
import { DoctorTimeSlot } from "src/entities/DoctorTimeSlot.entity";
import { EntityManager, Repository } from "typeorm";
import { CreateDoctorTimeSlotDTO } from "./dto/createDoctorTimeSlot.dto";
import { UpdateDoctorTimeSlotDTO } from "./dto/updateDoctorTimeSlot.dto";
import { DoctorTimeSlotResponseDTO } from "./dto/doctorTimeSlotResponse.dto";
import { Appointment } from "src/appointment/entity/Appointment.entity";
import { AppointmentStatus } from "src/appointment/entity/AppointmentStatus.enum";
import * as moment from "moment";
import { privateDecrypt } from "crypto";
import { SuggestedSlotNotificationService } from "src/common/notification/suggested-slot-notification.service";
import { ScheduleAppointmentService } from "src/appointment/schedule-appointment.service";
import { NotificationService } from "src/common/notification/notification.service";


@Injectable()
export class DoctorTimeSlotService{

    private readonly logger = new Logger(DoctorTimeSlot.name);

    constructor(
        @InjectRepository(DoctorTimeSlot)
        private readonly timeSlotRepo : Repository<DoctorTimeSlot>,
        @InjectRepository(DoctorAvailability)
        private readonly availablityRepo: Repository<DoctorAvailability>,
        @InjectRepository(Appointment)
        private readonly appointmentRepo: Repository<Appointment>,

        private readonly scheduledAppointmentService: ScheduleAppointmentService,
        private readonly notificationService: NotificationService,
        private readonly suggestedSlotNotificationService: SuggestedSlotNotificationService,
    ){}


    async createTimeSlot(availabilityId: number, dto: CreateDoctorTimeSlotDTO): Promise<DoctorTimeSlot>{

        // Get the availabilityId from the Availability table
        const availability = await this.availablityRepo.findOne({where : {id : availabilityId}});

        // If availabilityId is not present throw 404 exception
        if(!availability){
            throw new NotFoundException(`The availability id is not present in the database ${availabilityId}`);
        }

        // Check for the weekDay either from dto or from availability
        const weekday = dto.weekDay ?? availability.days_of_week;

        // Check for any duplicate entries present in the table
        const duplicateCheck = await this.timeSlotRepo.createQueryBuilder('slot')
        .where('slot.availability_id = :availabilityId', {availabilityId})
        .andWhere('slot.date = :date', {date: dto.date})
        .andWhere('slot.start_time = :start_time', {start_time: dto.start_time})
        .andWhere('slot.end_time = :end_time', {end_time : dto.end_time})
        .getOne();


        if(duplicateCheck){
            throw new BadRequestException('A slot with the same date and time already exist');
        }

        // Create and save the timeSlot in the database table
        const timeSlot = this.timeSlotRepo.create({
            ...dto,
            weekday,
            start_time : this.padTimeStr(dto.start_time),
            end_time: this.padTimeStr(dto.end_time),
            availability
        });

        return this.timeSlotRepo.save(timeSlot);
    }

    async findAll(availabilityId:number): Promise<DoctorTimeSlotResponseDTO[]>{
        const slot = this.timeSlotRepo.find({
            where : {availability : {id: availabilityId}},
            relations:['availability', 'availability.doctor'],
            order:{date:'ASC', start_time:'ASC'}
        });

        return (await slot).map(slot => ({
            id: slot.id,
            date : slot.date,
            weekday : slot.weekday,
            start_time : slot.start_time,
            end_time : slot.end_time,
            is_available: slot.is_available
        }));
    }


    async findAllSlotsByDoctorId(doctorId : number):Promise<DoctorTimeSlotResponseDTO[]>{
        const slot = this.timeSlotRepo.find({
            where : {availability : {doctor : {doctor_id : doctorId}}},
            relations:['avalability', 'availability.doctor'],
            order:{date:'ASC', start_time:'ASC'}
        });

        return (await slot).map(slot => ({
            id:slot.id,
            date:slot.date,
            weekday : slot.weekday,
            start_time : slot.start_time,
            end_time : slot.end_time,
            is_available : slot.is_available
        }));
    }

    async updateTimeSlot(slotId: number, dto:UpdateDoctorTimeSlotDTO):Promise<DoctorTimeSlot>{
        const slot = await this.timeSlotRepo.findOne({
            where : {id: slotId},
            relations:['availability']
        });

        if(!slot){
            throw new NotFoundException(`Time Slot not found with that id ${slotId}`);
        }

        // Prepare the values for duplicate check
        // We get the value either from the dto entries or from the dB
        const date = dto.date ?? slot.date;
        const start_time = this.padTimeStr(dto.start_time ?? slot.start_time);
        const end_time = this.padTimeStr(dto.end_time ?? slot.end_time);

        // Duplicate check
        const duplicateCheck = await this.timeSlotRepo.createQueryBuilder('slot')
        .where('slot.availability_id = :availabilityId', {availabilityId : slot.availability.id})
        .andWhere('slot.date = :date', {date})
        .andWhere('slot.start_time = :start_time',{start_time})
        .andWhere('slot.end_time = :end_time', {end_time})
        .andWhere('slot.id != :id',{id: slotId})
        .getOne();
        

        if(duplicateCheck){
            throw new BadRequestException('Another slot with the same date and time exists.');
        }

        Object.assign(slot, dto, {start_time, end_time, date});

        return this.timeSlotRepo.save(slot);
    }

    async delete(slotId: number): Promise<{message: string}>{
        const slot = await this.timeSlotRepo.findOne({
            where : {id:slotId},
            relations:['appointments']
        });

        if(!slot){
            throw new NotFoundException(`Time SLot is not available for the id ${slotId}`);
        }

        const activeAppointments = slot.appointments.filter(
            appt => appt.status === AppointmentStatus.SCHEDULED || appt.status === AppointmentStatus.PENDING
        );

        if(activeAppointments.length > 0){
            throw new BadRequestException(
                `Cannot delete time slot with ID ${slotId} because it has ${activeAppointments.length} ` +
                `active appointments linked to it. Please cancel/reassign these appointments first.`
            );
        }

        this.timeSlotRepo.remove(slot);

        return {message : `Doctor time slot with id ${slotId} deleted.`}
    }


    async shrinkSlotsForDate(
        doctorId: number,
        date: string,
        newStartTime: string,
        newEndTime: string
    ){  
        // Find all the slots of the doctor and the date for which we are going to shrink
        const slots = await this.timeSlotRepo.find({
            where : {
                availability : { doctor : {doctor_id : doctorId}},
                date:date
            },
            relations : [
                'appointments',
                'appointments.patient',
                'appointments.patient.user',
                'appointments.doctor',
                'appointments.doctor.user',
                'availability'
            ],
            order : {start_time : 'ASC'}
        });


        // slots is an array of 3 DoctorTimeSlot objects:

        // slot.id	slot.start_time	slot.end_time	slot.date	slot.appointments
        // 1	        '09:00'	       '10:00'	   '2025-07-25'	    []
        // 2	        '10:00'	       '11:00'	   '2025-07-25'	    []
        // 3	        '11:00'	       '13:00'	   '2025-07-25'	    [appt1, appt2]

        if(!slots.length){
            throw new NotFoundException('No slots found for this date');
        }

        // New availability timings that we are going to pass using the body of the api
        const newStartMoment = moment(`${date} ${newStartTime}`, 'YYYY-MM-DD HH:mm');   //09:00
        const newEndMoment = moment(`${date} ${newEndTime}`, 'YYYY-MM-DD HH:mm');       //12:00

        const affectedAppointments: Appointment[] = [];
        const slotsToSave: DoctorTimeSlot[] = [];
        const slotsToRemove: DoctorTimeSlot[] = [];

        for(const slot of slots){
            const slotStart = moment(`${date} ${slot.start_time}`, 'YYYY-MM-DD HH:mm');     //09:00     //10:00     //11:00
            const slotEnd = moment(`${date} ${slot.end_time}`, 'YYYY-MM-DD HH:mm');         //10:00     //11:00     //13:00


            // Slot is completely outside of new range
            if(slotEnd.isSameOrBefore(newStartMoment) || slotStart.isSameOrAfter(newEndMoment)){
                slot.is_available = false;
                slotsToSave.push(slot);

                for(const appt of slot.appointments){
                    appt.status = AppointmentStatus.PENDING_DOCTOR_AVAILABILITY_CHANGE;
                    appt.feedback = `Doctor Availability changed. Original Slot was (${slot.date} ${slot.start_time}-${slot.end_time} is no longer available)`;
                    affectedAppointments.push(appt);
                }
            }


            // Slots are inside the range of the newStart and newEnd
            else if(slotStart.isSameOrAfter(newStartMoment) && slotEnd.isSameOrBefore(newEndMoment)){
                continue;
            }

            // Slots are getting overlapped with the new timings
            else if(slotStart.isBefore(newEndMoment) && slotEnd.isAfter(newEndMoment)){
                
                const oldStarTime = slot.start_time;
                const oldEndTime = slot.end_time;
                slot.end_time = newEndTime;
                slotsToSave.push(slot);

                // Mark the scheduled appointments as affected and change the status and save it to DB.
                const validAppointments : Appointment[] = [];
                let affectedCount = 0;
                for(const appt of slot.appointments){
                    const apptTime = moment(appt.appointment_time);

                    if(apptTime.isSameOrAfter(newEndMoment)){ // Out of range of the new available slot
                        appt.status = AppointmentStatus.PENDING_DOCTOR_AVAILABILITY_CHANGE;
                        appt.feedback = `Doctor Availability changed. Original Slot was (${slot.date} ${slot.start_time}-${oldEndTime} is no longer available)`;
                        affectedAppointments.push(appt);
                        affectedCount++;
                    }
                    else{
                        validAppointments.push(appt);
                    }
                }
                
                slot.booked_count = validAppointments.length;
                slotsToSave.push(slot)


                // Create the overlaping slot, save it to dB and mark it as unavailable
                const afterSlot = this.timeSlotRepo.create({
                    date: slot.date,
                    weekday: slot.weekday,
                    availability:slot.availability,
                    booked_count:0,
                    max_booking:slot.max_booking,
                    start_time: newEndTime,
                    end_time: oldEndTime,
                    is_available:false,
                    appointments:[]
                });

                slotsToSave.push(afterSlot);
            }


            // Slot overlaps at the start Old slot - 9-10 , new Slot - 8-9:30
            // else if(slotStart.isBefore(newStartMoment) && slotEnd.isAfter(newStartMoment)){

            // }


            // Save the changes using Transaction
            await this.timeSlotRepo.manager.transaction(async (manager : EntityManager) => {
                if(slotsToSave.length){
                    await manager.save(slotsToSave);
                }

                if(affectedAppointments.length){
                    await manager.save(affectedAppointments);
                }


                // Notify the patients for the affected appointments and suggest a new slot
                for(const appt of affectedAppointments){
                    this.logger.log(`Notifying Patients ${appt.patient.user.email} about appointment ID ${appt.id} change.`);

                    // Find the nearest Slot
                    const nearestSlot = await this.scheduledAppointmentService.findNearestAvailableSlot(
                        appt.doctor.doctor_id,
                        moment(appt.appointment_time),
                        manager
                    );
                    
                    // Notify the patient for the nearestSlot
                    const message = await this.suggestedSlotNotificationService.sendSuggestedSlotNotification(
                        appt,
                        nearestSlot,
                        slot.availability,
                        newStartTime,
                        newEndTime
                    )




                    // If a slot is found, set 1 hour expiry for the option 1 and notify
                    
                    appt.suggested_slot_expiry = moment().add(1, 'hour').toDate();

                    await manager.save(appt);

                    const patientEmial= appt.patient?.user?.email ?? 'unknown';
                    const doctorName = appt.doctor.user ? appt.doctor.user.first_name +' '+ appt.doctor.user.last_name : 'unknown_doctor';


                    await this.notificationService.sendAppointmentChangeNotification(
                        patientEmial,
                        doctorName,
                        message,
                        appt.appointment_time
                    )
                }
            });
        }
        
        return slots;
    }

    private padTimeStr(time: string):string {
        return time?.length === 5 ? `${time}:00` : time;
    }
}