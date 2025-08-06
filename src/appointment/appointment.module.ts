import { Module } from '@nestjs/common';
import { AppointmentController } from './appointment.controller';
import { AppointmentService } from './appointment.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Doctor } from 'src/entities/Doctor.entity';
import { Patient } from 'src/entities/Patient.entity';
import { Appointment } from './entity/Appointment.entity';
import { DoctorTimeSlot } from 'src/entities/DoctorTimeSlot.entity';
import { DoctorAvailability } from 'src/entities/DoctorAvailability.entity';
import { ScheduleAppointmentService } from './schedule-appointment.service';
import { SuggestedSlotNotificationService } from 'src/common/notification/suggested-slot-notification.service';
import { NotificationService } from 'src/common/notification/notification.service';

@Module({
  imports:[
    TypeOrmModule.forFeature([
      Doctor,
      Patient,
      Appointment,
      DoctorTimeSlot,
      DoctorAvailability,
    ])
  ],
  controllers: [AppointmentController],
  providers: [AppointmentService,ScheduleAppointmentService, SuggestedSlotNotificationService, NotificationService],
  exports:[AppointmentService,ScheduleAppointmentService]
})
export class AppointmentModule {}
