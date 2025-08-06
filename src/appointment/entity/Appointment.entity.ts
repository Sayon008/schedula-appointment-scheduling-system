import { Doctor } from "src/entities/Doctor.entity";
import { DoctorTimeSlot } from "src/entities/DoctorTimeSlot.entity";
import { Patient } from "src/entities/Patient.entity";
import { WeekDay } from "src/entities/WeekDay.enum";
import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, OneToMany, PrimaryGeneratedColumn, Timestamp, Unique, UpdateDateColumn } from "typeorm";
import { AppointmentStatus } from "./AppointmentStatus.enum";
import { time } from "console";



@Entity('appointments')
@Unique(['patient', 'doctor', 'timeSlot', 'status'])
export class Appointment{
    @PrimaryGeneratedColumn()
    id: number;

    @Column({
        type:'timestamptz',
        nullable:false
    })
    appointment_time:Date;

    @Column({
        type:'enum',
        enum:WeekDay
    })
    weekday : WeekDay;

    @Column({
        type:'enum',
        enum:AppointmentStatus,
        nullable:false
    })
    status:AppointmentStatus;

    @Column({
        type:'jsonb',
        nullable:true
    })
    chat:Record<string, any>;
    
    @Column({
        type:'varchar',
        nullable:true
    })
    feedback?:string

    @CreateDateColumn()
    created_at:Date;

    @UpdateDateColumn()
    updated_at:Date;


    @ManyToOne(() => Doctor, (doctor) => doctor.appointments, {nullable:false, onDelete:'CASCADE'})
    @JoinColumn({name:'doctor_id'})
    doctor: Doctor;

    @ManyToOne(() => Patient, (patient) => patient.appointments, {nullable:false, onDelete:'CASCADE'})
    @JoinColumn({name:'patient_id'})
    patient: Patient;

    // The specific time slot that this appointment is booked for
    @ManyToOne(() => DoctorTimeSlot, (timeSlot) => timeSlot.appointments, {nullable : false, onDelete:'RESTRICT'})
    @JoinColumn({name: 'time_slot_id'})
    timeSlot:DoctorTimeSlot;

    // @OneToMany(() => SuggestedSlotOffer, offer => offer.appointment)
    // suggestedSlotOffer: SuggestedSlotOffer;

    @Column({ type: 'timestamp', nullable: true })
    suggested_slot_expiry: Date; // When Option 1 expires
}