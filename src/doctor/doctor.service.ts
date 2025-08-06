import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Doctor } from 'src/entities/Doctor.entity';
import { User } from 'src/entities/User.entity';
import { Repository } from 'typeorm';
import { UpdateDoctorDTO } from './dto/updateDoctor.dto';

@Injectable()
export class DoctorService {
    constructor(
        @InjectRepository(Doctor) private readonly doctorRepo: Repository<Doctor>,
        @InjectRepository(User) private readonly userRepo: Repository<User>,
    ) { }

    async findAll() {
        const doctors = this.doctorRepo.find({
            relations: ['user']
        });

        return doctors;
    }

    async findById(id: number) {
        const doctor = this.doctorRepo.findOne({
            where: { doctor_id: id },
            relations: ['user']
        });

        if (!doctor) {
            throw new NotFoundException("Doctor not found with the provide id");
        }

        return doctor;
    }

    async update(id: number, updateDoctorDto: UpdateDoctorDTO): Promise<Doctor> {
        const doctor = await this.findById(id);

        if (!doctor) {
            throw new NotFoundException(`Doctor with the requested id is not present : ${id}`)
        }
        
        Object.assign(doctor, updateDoctorDto);

        return await this.doctorRepo.save(doctor);
    }

    async delete(id:number): Promise<{message: string}>{
        const doctor = await this.findById(id);

        if(!doctor){
            throw new NotFoundException(`Doctor with the given id is not present ${id}`);
        }

        await this.doctorRepo.remove(doctor);

        return {message : `Doctor with id ${id} has been deleted`};
    }
}
