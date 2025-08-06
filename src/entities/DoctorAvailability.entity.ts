import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, OneToMany, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";
import { Doctor } from "./Doctor.entity";
import { DoctorTimeSlot } from "./DoctorTimeSlot.entity";
import { WeekDay } from "./WeekDay.enum";

export enum SessionType{
    MORNING = 'morning',
    EVENING = 'evening'
}



@Entity('doctor_availability')
export class DoctorAvailability{

    @PrimaryGeneratedColumn()
    id:number

    // @Column()
    // user_id:number;      // Foreign Key-> Manually declared(Not Recommended)

    // @Column({type:'date'})
    // date: string;

    @Column({
        type:'enum',
        enum:SessionType,
        nullable:true
    })
    session: SessionType;

    @Column({type:'time'})
    start_time:string;

    @Column({type:'time'})
    end_time:string;

    @Column({
        type:'enum',
        enum:WeekDay,
        array:true,     // Allowing multiple days in availability
        nullable:false
    })
    days_of_week:WeekDay[];

    @ManyToOne(() => Doctor, doctor => doctor.availabilities, {onDelete:'CASCADE'})
    @JoinColumn({name: 'doctor_id'})
    doctor:Doctor;

    @OneToMany(() => DoctorTimeSlot, (timeslot) => timeslot.availability)
    time_slots:DoctorTimeSlot[];

    @CreateDateColumn()
    created_at: Date;

    @UpdateDateColumn()
    updated_at: Date;

}