import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { Patient } from 'src/entities/Patient.entity';
import { Repository } from 'typeorm';
import { CreatePatientDTO } from './dto/createPatient.dto';
import { PatientResponseDTO } from './dto/patientResponse.dto';
import { UpdatePatientDTO } from './dto/updatePatient.dto';
import { User } from 'src/entities/User.entity';
import { InjectRepository } from '@nestjs/typeorm';

@Injectable()
export class PatientService {
    constructor(
        @InjectRepository(Patient)
        private readonly patientRepo: Repository<Patient>,
        @InjectRepository(User)
        private readonly userRepo: Repository<User>
    ){}

    // async createPatient(userId:number, dto: CreatePatientDTO):Promise<PatientResponseDTO>{
    //     const user = await this.userRepo.findOne({where : {user_id: userId}});

    //     if(!user){
    //         throw new NotFoundException('User Not Found!!');
    //     }

    //     //Check if the patient already exist or not
    //     const existPatient = await this .patientRepo.findOne({where : {user : {user_id : userId}}});

    //     if(existPatient){
    //         throw new ConflictException('Patient already exists for this user!');
    //     }

    //     const patient = await this.patientRepo.create({...dto, user});

    //     await this.patientRepo.save(patient);

    //     return this.toResponseDTO(patient);
    // }

    async findAll(): Promise<PatientResponseDTO[]>{
        const patientList = await this.patientRepo.find({relations : ['user']});
        return patientList.map((p) => this.toResponseDTO(p));
    }


    async findOne(patientId : number) : Promise<PatientResponseDTO>{
        const patient = await this.patientRepo.findOne({
            where : { patient_id : patientId},
            relations: ['user']
        });

        if(!patient){
            throw new NotFoundException(`No Patient found with this id : - ${patientId}`);
        }

        return this.toResponseDTO(patient);
    }


    async update(patientId:number, dto: UpdatePatientDTO):Promise<PatientResponseDTO>{
        const patient = await this.patientRepo.findOne({
            where : {patient_id : patientId},
            relations : ['user']
        });

        if(!patient){
            throw new NotFoundException(`This is not a valid id - ${patientId} Please provaide a valid pateintId and try again!!`);
        }

        Object.assign(patient, dto);

        await this.patientRepo.save(patient);

        return this.toResponseDTO(patient);
    }

    async remove(patientId:number): Promise <{message:string}>{
        const patient = await this.patientRepo.findOne({where : { patient_id : patientId}});

        if(!patient){
            throw new NotFoundException('Patient Not Found');
        }

        this.patientRepo.remove(patient);

        return { message: `Patient with id ${patientId} deleted.` };
    }

    private toResponseDTO(patient : Patient): PatientResponseDTO{
        const responseDto : PatientResponseDTO ={
            patient_id : patient.patient_id,
            phone_number : patient.phone_number,
            age: patient.age,
            sex : patient.sex,
            weight: patient.weight,
            first_name : patient.user.first_name,
            last_name: patient.user.last_name,
            email: patient.user.email
        };

        return responseDto;
    }
}
