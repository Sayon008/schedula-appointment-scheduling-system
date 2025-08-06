import { Column, Entity, JoinColumn, OneToMany, OneToOne, PrimaryColumn, PrimaryGeneratedColumn } from "typeorm";
import { User } from "./User.entity";
import { DoctorAvailability } from "./DoctorAvailability.entity";
import { Appointment } from "src/appointment/entity/Appointment.entity";


export enum Specialization {
    CARDIOLOGY = 'Cardiology',
    DERMATOLOGY = 'Dermatology',
    ENDOCRINOLOGY = 'Endocrinology',
    GASTROENTEROLOGY = 'Gastroenterology',
    GENERAL_MEDICINE = 'General Medicine',
    GYNECOLOGY = 'Gynecology',
    NEUROLOGY = 'Neurology',
    ONCOLOGY = 'Oncology',
    ORTHOPEDICS = 'Orthopedics',
    PEDIATRICS = 'Pediatrics',
    PSYCHIATRY = 'Psychiatry',
    PULMONOLOGY = 'Pulmonology',
    RADIOLOGY = 'Radiology',
    SURGERY = 'Surgery',
    UROLOGY = 'Urology'
}
@Entity('doctors')
export class Doctor{
    @PrimaryGeneratedColumn()
    doctor_id: number;

    @Column({
        type:'enum',
        enum:Specialization,
        nullable:false,
    })
    specialization: Specialization;

    @Column({
        type:'integer',
        nullable:false
    })
    years_of_exp:number;

    @OneToOne(() => User,(user) => user.doctor, {onDelete : 'CASCADE'})
    @JoinColumn({name : 'user_id'})     // creating uder_id col in doctors table
    user: User;

    @OneToMany(() => Appointment, (appointment) => appointment.doctor)
    appointments: Appointment[];

    @OneToMany(() => DoctorAvailability, (avail) => avail.doctor)
    availabilities: DoctorAvailability[];
}