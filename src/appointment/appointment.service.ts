import { BadRequestException, Injectable, NotFoundException, Param } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Appointment } from './entity/Appointment.entity';
import { Doctor } from 'src/entities/Doctor.entity';
import { DoctorTimeSlot } from 'src/entities/DoctorTimeSlot.entity';
import { Patient } from 'src/entities/Patient.entity';
import { Repository, Transaction } from 'typeorm';
import { CreateAppointmentDTO } from './dto/createAppointment.dto';
import { AppointmentStatus } from './entity/AppointmentStatus.enum';
import { AppointmnetResponseDTO } from './dto/appointmentResponse.dto';
import { formatTime } from 'src/common/utils/date-format.util';
import { UpdateAppointmentDTO } from './dto/updateAppointment.dto';

@Injectable()
export class AppointmentService {
    constructor(
        @InjectRepository(Appointment)
        private readonly appointmentRepo : Repository<Appointment>,
        @InjectRepository(Doctor)
        private readonly doctorRepo : Repository<Doctor>,
        @InjectRepository(Patient)
        private readonly patientRepo: Repository<Patient>,
        @InjectRepository(DoctorTimeSlot)
        private readonly timeSlotRepo: Repository<DoctorTimeSlot>
    ){}


    async createAppointment(dto: CreateAppointmentDTO): Promise<Appointment>{
        const timeSlot = await this.timeSlotRepo.findOne({
            where :{id : dto.time_slot_id},
            relations: ['availability', 'availability.doctor']
        });

        if(!timeSlot){
            throw new NotFoundException(`Time slot with ID ${dto.time_slot_id} not found.`);
        }

        if(timeSlot.is_available == false){
            throw new BadRequestException('This time slot is not available for booking.');
        }

        if(timeSlot.booked_count >= timeSlot.max_booking){
            throw new BadRequestException('This time slot is fully booked.');
        }

        //Validation of the slot timings
        const requestedApptTime = new Date(dto.appointment_time);
        const slotStartDateTime = new Date(`${timeSlot.date}T${timeSlot.start_time}`);
        const slotEndDateTime = new Date(`${timeSlot.date}T${timeSlot.end_time}`);


        if(requestedApptTime.getTime() < slotStartDateTime.getTime() || requestedApptTime.getTime() > slotEndDateTime.getTime()){
            throw new BadRequestException(`Appointment time must be within the selected time slot (${timeSlot.date} ${timeSlot.start_time}-${timeSlot.end_time}).`);
        }

        const patient = await this.patientRepo.findOne({
            where: {patient_id : dto.patient_id}
        });

        if(!patient){
            throw new NotFoundException(`Patient with ID ${dto.patient_id} not found.`);
        }

        const doctor = await this.doctorRepo.findOne({where : {doctor_id : dto.doctor_id}});

        if(!doctor){
            throw new NotFoundException(`Doctor linked with timeSlot ${dto.time_slot_id} was not found`);
        }

        const existedAppointment = await this.appointmentRepo.findOne({
            where:{
                patient  : {patient_id :dto.patient_id},
                doctor : {doctor_id :dto.doctor_id},
                timeSlot :{id : dto.time_slot_id},
                status: AppointmentStatus.SCHEDULED
            },
        });

        if(existedAppointment){
            throw new BadRequestException('You already have a appointment with the same time slot')
        }

        // Create the appointment
        const appointment = this.appointmentRepo.create({
            patient:patient,
            doctor:doctor,
            timeSlot : timeSlot,
            appointment_time:requestedApptTime,
            weekday:timeSlot.weekday,
            status:AppointmentStatus.SCHEDULED
        });

        // Updating the doctor timeslot booked count and availability status
        timeSlot.booked_count++;
        if(timeSlot.booked_count >= timeSlot.max_booking){
            timeSlot.is_available=false;
        }

        await this.timeSlotRepo.manager.transaction(async transactionalEntityManager  =>{
            await transactionalEntityManager.save(timeSlot);
            await transactionalEntityManager.save(appointment);
        });

        return appointment;
    }

    async findAllApointments(doctorId?: number, patientId?:number): Promise<AppointmnetResponseDTO[]>{
        const whereClause:any = {};

        if(doctorId){
            whereClause.doctor = {doctor_id : doctorId};
        }

        if(patientId){
            whereClause.patient = {patient_id : patientId};
        }

        const appointments = await this.appointmentRepo.find({
            where : whereClause,
            relations:['doctor','patient','timeSlot','doctor.user','patient.user'],
            order : {appointment_time :'ASC'}
        });

        return appointments.map( appt => ({
            id:appt.id,
            appointment_time : appt.appointment_time,
            appointment_time_formatted: formatTime(appt.appointment_time),
            status : appt.status,
            chat : appt.chat,
            feedback : appt.feedback,
            doctor_info: {
                doctor_id: appt.doctor.doctor_id,
                firstName: appt.doctor.user.first_name,
                lastName: appt.doctor.user.last_name,
                specialization: appt.doctor.specialization,
                email: appt.doctor.user.email,
            },
            patient_info: {
                patient_id: appt.patient.patient_id,
                firstName: appt.patient.user.first_name,
                lastName: appt.patient.user.last_name,
                email: appt.patient.user.email,
                phone_number: appt.patient.phone_number === null ? undefined : appt.patient.phone_number
            },
            time_slot_info: {
                id: appt.timeSlot.id,
                date: appt.timeSlot.date,
                start_time: appt.timeSlot.start_time,
                end_time: appt.timeSlot.end_time
            }
        }));
    }

    async findAppointementById(id: number): Promise<AppointmnetResponseDTO>{

        const appointment = await this.appointmentRepo.findOne({
            where : {id : id},
            relations:['doctor','patient','doctor.user','patient.user','timeSlot']
        });

        if(!appointment){
            throw new NotFoundException(`No appointemnet found by the id ${id}`);
        }

        return{
            id: appointment.id,
            appointment_time:appointment.appointment_time,
            appointment_time_formatted: formatTime(appointment.appointment_time),
            status : appointment.status,
            chat: appointment.chat,
            feedback: appointment.feedback,
            doctor_info: {
                doctor_id: appointment.doctor.doctor_id,
                firstName: appointment.doctor.user.first_name,
                lastName: appointment.doctor.user.last_name,
                specialization: appointment.doctor.specialization,
                email: appointment.doctor.user.email
            },
            patient_info: {
                patient_id: appointment.patient.patient_id,
                firstName: appointment.patient.user.first_name,
                lastName: appointment.patient.user.last_name,
                email: appointment.patient.user.email,
                phone_number: appointment.patient.phone_number === null ? undefined : appointment.patient.phone_number,
            },
            time_slot_info: {
                id: appointment.timeSlot.id,
                date: appointment.timeSlot.date,
                start_time: appointment.timeSlot.start_time,
                end_time: appointment.timeSlot.end_time
            }
        }
    }


    async updateAppoinment(apptId:number, dto:UpdateAppointmentDTO):Promise<Appointment>{

        const appointment = await this.appointmentRepo.findOne({
            where : {id : apptId},
            relations: ['timeSlot']
        });

        if(!appointment){
            throw new NotFoundException(`Appointment with id ${apptId} Not Found`);
        }


        // Changing the Status of the appointment
        const originalStatus = appointment.status;

        const newStatus = dto.status ?? originalStatus;

        // Checking if actually the status is getting changed or not
        if(newStatus !== originalStatus){

            // Checks if the original status was 'SCHEDULED' or 'PENDING' (active states)
            // AND the new status is a cancellation/no-show status.
            if(
                (originalStatus === AppointmentStatus.SCHEDULED || originalStatus === AppointmentStatus.PENDING) &&
                (newStatus === AppointmentStatus.CANCELLED_BY_DOCTOR || newStatus === AppointmentStatus.CANCELLED_BY_PATIENT || 
                    newStatus === AppointmentStatus.NO_SHOW)
            ){
                appointment.timeSlot.booked_count--;

                appointment.timeSlot.is_available = true;
            }

            await this.timeSlotRepo.save(appointment.timeSlot);

            console.log('Notify the doctor and the patient for the cancellation');

        }
        // Checks if the original status was a cancelled/final state
        // AND the new status is 'SCHEDULED' or 'PENDING' (reactivating it).
        else if(
            (originalStatus === AppointmentStatus.CANCELLED_BY_DOCTOR || originalStatus === AppointmentStatus.CANCELLED_BY_PATIENT ||
                originalStatus === AppointmentStatus.NO_SHOW
            ) &&
            (newStatus === AppointmentStatus.SCHEDULED || newStatus === AppointmentStatus.PENDING)
        ){

            if(appointment.timeSlot.booked_count > appointment.timeSlot.max_booking){
                throw new BadRequestException('Cannot reactivate appointment: Time slot is already full.');
            }


            appointment.timeSlot.booked_count++;

            appointment.timeSlot.is_available = false;

            await this.appointmentRepo.save(appointment.timeSlot);

            // TODO: Placeholder for notifications.
            console.log("Notify doctor/patient of reactivation");
        }

         // Add more status transition logic as needed (e.g., SCHEDULED -> COMPLETED, RESCHEDULED, etc.)

        // If 'appointment_time' is updated in the DTO.

        if(dto.appointment_time){
            const newApptTime = new Date(dto.appointment_time);

            const slotStartDateTime = new Date(`${appointment.timeSlot.date}T${appointment.timeSlot.start_time}`);
            const slotEndDateTime = new Date(`${appointment.timeSlot.date}T${appointment.timeSlot.end_time}`);

            if(newApptTime.getTime() < slotStartDateTime.getTime() || newApptTime.getTime() > slotEndDateTime.getTime()){
                throw new BadRequestException(`New appointment time must be within the original time slot (${appointment.timeSlot.date} ${appointment.timeSlot.start_time}-${appointment.timeSlot.end_time}).`)
            }


            appointment.appointment_time = newApptTime;
        }



        Object.assign(appointment, dto);

        return this.appointmentRepo.save(appointment);

    }

    async cancelAppointment(appointmentId: number):Promise<{message: string}>{
        const appointment = await this.appointmentRepo.findOne({
            where : {id : appointmentId},
            relations:['timeSlot']
        });

        if(!appointment){
            throw new NotFoundException(`Appointment with id ${appointmentId} not found`);
        }

        if(appointment.status === AppointmentStatus.CANCELLED_BY_DOCTOR || appointment.status === AppointmentStatus.CANCELLED_BY_PATIENT ||
            appointment.status === AppointmentStatus.COMPLETED || appointment.status === AppointmentStatus.NO_SHOW
        ){
            throw new BadRequestException(`Appointment with id ${appointmentId} already in final or cancelled state`);
        }

        appointment.status = AppointmentStatus.CANCELLED_BY_PATIENT;

        appointment.feedback = 'Appointmnet cancelled by patient';

        appointment.timeSlot.booked_count--;

        appointment.timeSlot.is_available = true;


        // Use Transaction to save both the timeslot and the appointment status at the same time
        await this.timeSlotRepo.manager.transaction(async transactionalEntityManager => {
            await transactionalEntityManager.save(appointment.timeSlot),
            await transactionalEntityManager.save(appointment)
        });

        return { message: `Appointment with ID ${appointmentId} has been cancelled.` };
    }


    async deleteAppointment(appointmentId: number):Promise<{message:string}>{

        const appointment = await this.appointmentRepo.findOne({
            where : {id: appointmentId},
            relations:['timeSlot']
        });

        if (!appointment) {
            throw new NotFoundException(`Appointment with ID ${appointmentId} not found.`);
        }

        if(appointment.status === AppointmentStatus.SCHEDULED || appointment.status === AppointmentStatus.PENDING){
            appointment.timeSlot.booked_count--;

            appointment.timeSlot.is_available = true;

            await this.timeSlotRepo.save(appointment.timeSlot);
        }

        await this.appointmentRepo.remove(appointment);

        return { message: `Appointment with ID ${appointmentId} has been deleted.` };

    }

}
