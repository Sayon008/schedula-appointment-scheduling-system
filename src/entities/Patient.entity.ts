import { Column, Entity, JoinColumn, OneToMany, OneToOne, PrimaryColumn, PrimaryGeneratedColumn } from "typeorm";
import { User } from "./User.entity";
import { Appointment } from "src/appointment/entity/Appointment.entity";


export enum Sex{
    MALE = "male",
    FEMALE ="female",
    OTHER = "other",
}

@Entity('patients')
export class Patient{
    @PrimaryGeneratedColumn()
    patient_id: number;

    @Column({
        type:'varchar',
        length:10,
        nullable:true
    })
    phone_number:string | null;

    @Column({
        type:'int',
        nullable:true
    })
    age:number | null;

    @Column({
        type:'enum',
        enum:Sex,
        nullable:true,
    })
    sex:Sex | null;

    @Column({
        type:'int',
        nullable:true,
    })
    weight:number | null;

    @OneToOne(() => User, (user) => user.patient, {onDelete:'CASCADE'})
    @JoinColumn({name:'user_id'})
    user:User;

    @OneToMany(() => Appointment, (appointment) => appointment.patient)
    appointments: Appointment[];
}