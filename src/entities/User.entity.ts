import { Column, Entity, OneToOne, PrimaryGeneratedColumn } from "typeorm";
import { Patient } from "./Patient.entity";
import { Doctor } from "./Doctor.entity";

export enum UserRole{
    DOCTOR = 'doctor',
    PATIENT = 'patient'
}

@Entity('users')
export class User{
    @PrimaryGeneratedColumn()
    user_id: number;

    @Column({
        type:'varchar',
        nullable:false,
        unique:true
    })
    email: string;

    @Column({
        type:'varchar',
        nullable:false
    })
    password: string;

    @Column({
        type:'varchar',
        nullable:false
    })
    first_name:string;

    @Column({
        type:'varchar',
        nullable:false
    })
    last_name: string;

    @Column({
        type:'text',
        nullable:true
    })
    profile_photo: string;

    @Column({
        type:'enum',
        enum: UserRole,
        nullable:false
    })
    role: UserRole;



    @OneToOne(() => Patient, (patient) => patient.user)
    patient?: Patient;

    @OneToOne(() => Doctor, (doctor) => doctor.user)
    doctor? : Doctor;
}