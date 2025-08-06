import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, OneToMany, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";
import { DoctorAvailability } from "./DoctorAvailability.entity";
import { WeekDay } from "./WeekDay.enum";
import { Appointment } from "src/appointment/entity/Appointment.entity";

@Entity('doctor_time_slot')
export class DoctorTimeSlot{
    @PrimaryGeneratedColumn()
    id:number;

    @Column({type:'date'})
    date:string;        // The actual date of the slot
    

    @Column({
        type:'enum',
        enum:WeekDay,
        nullable:false
    })
    weekday : WeekDay;

    @ManyToOne(() => DoctorAvailability, (availability) => availability.time_slots, {onDelete:'CASCADE'})
    @JoinColumn({name:'availability_id'})
    availability: DoctorAvailability;

    @Column({default:0})
    booked_count:number;

    @Column({default: 1})
    max_booking:number;     // Per slot max number of booking, by default 1

    @Column({type:'time'})
    start_time:string;

    @Column({type:'time'})
    end_time:string;

    @Column({
        type:'boolean',
        default:true
    })
    is_available:boolean;

    @CreateDateColumn()
    created_at:Date;

    @UpdateDateColumn()
    updated_at:Date;

    @OneToMany(() => Appointment, (appointmnet) => appointmnet.timeSlot)
    appointments:Appointment[];
}