import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Doctor } from 'src/entities/Doctor.entity';
import { DoctorAvailability } from 'src/entities/DoctorAvailability.entity';
import { Repository } from 'typeorm';
import { CreateDoctorAvailabilityDTO } from './dto/createDoctorAvailability.dto';
import { UpdateDoctorAvailabilityDTO } from './dto/updateDoctorAvailability.dto';
import { SchedulingConflictService } from 'src/elasticScheduling/scheduling-conflict.service';
import moment from 'moment';


@Injectable()
export class DoctorAvailabilityService {

    constructor(
        @InjectRepository(DoctorAvailability) private readonly availabilityRepo:Repository<DoctorAvailability>,
        @InjectRepository(Doctor) private readonly doctorRepo: Repository<Doctor>,
        private readonly schedulingConflictService: SchedulingConflictService,
    ){}

    async create(doctorId:number, dto : CreateDoctorAvailabilityDTO): Promise<DoctorAvailability>{
        const doctor = await this.doctorRepo.findOne({where: {doctor_id : doctorId}});

        if(!doctor){
            throw new NotFoundException(`Doctor Not Found with ${doctorId}`);
        }


        const duplicateCheck = await this.availabilityRepo.createQueryBuilder('availability')
        .where('availability.doctor_id = :doctorId', { doctorId})
        .andWhere('availability.session = :session', {session: dto.session})
        .andWhere('availability.start_time = :start_time', {start_time: dto.start_time})
        .andWhere('availability.end_time = :end_time', {end_time:dto.end_time})
        .andWhere('availability.days_of_week && :days::doctor_availability_days_of_week_enum[]',{days:dto.days_of_week})
        .getOne();

        if(duplicateCheck){
            throw new BadRequestException({
                message:'Duplicate entries has been found for session, start time/end time or the day of the week, already exist in the dB',
                duplicate : duplicateCheck
            });
        }

        // Create and save the availability in the dB
        const newAvailability = this.availabilityRepo.create({...dto, doctor});

        return await this.availabilityRepo.save(newAvailability);
    }


    async findAll(doctor_id:number): Promise<DoctorAvailability[]>{
        const availabilities = this.availabilityRepo.find({
            where: {doctor: {doctor_id:doctor_id}},
            relations: ['time_slots']
        });

        return availabilities;
    }


    async update(availabilityId: number, dto:UpdateDoctorAvailabilityDTO){
        const availability = await this.availabilityRepo.findOne({
            where :{id: availabilityId},
            relations:['doctor']
        });

        if(!availability){
            throw new NotFoundException(`Availibity slots not found for this  id - ${availabilityId}`);
        }

        // Prepare new values for check (use existing if not provided)
        const session = dto.session ?? availability.session;
        const start_time = dto.start_time ?? availability.start_time;
        const end_time = dto.end_time ?? availability.end_time;
        const days_of_week = dto.days_of_week ?? availability.days_of_week;

        // Now check for duplicates
        const duplicateCheck = await this.availabilityRepo.createQueryBuilder('availability')
        .where('availability.doctor_id = :doctorId', {doctorId:availability.doctor.doctor_id})
        .andWhere('availability.session = :session',{session})
        .andWhere('availability.start_time = :start_time',{start_time})
        .andWhere('availability.end_time = :end_time',{end_time})
        .andWhere('availability.days_of_week && :days::doctor_availability_days_of_week_enum[]', {days:days_of_week})
        .andWhere('availability.id != :id',{id : availabilityId})
        .getOne();

        if (duplicateCheck) {
        throw new BadRequestException({
                message: 'Duplicate availability: Same session, days, and time already exist.',
                duplicateValues : duplicateCheck
            });
        }

        const oldAvailability = {...availability};

        Object.assign(availability, dto);


        // Handling the changing availability w.r.t time slots and appointments
        await this.availabilityRepo.manager.transaction(async (transactionalEntityManager) => {
            await transactionalEntityManager.save(availability);

            await this.schedulingConflictService.handleAvailabiltyConflict(
                oldAvailability,
                availability,
                transactionalEntityManager
            );
        });

        return availability;
    }


    async delete(availabilityId : number): Promise<{message:string}>{

        const availability = await this.availabilityRepo.findOne({where : {id: availabilityId}})

        if(!availability){
            throw new NotFoundException("Availability For this id doesnot exist");
        }

        await this.availabilityRepo.remove(availability);

        return {message:`Doctors Availability with this ${availabilityId} has been deleted.`};

    }

}
