import { Module } from '@nestjs/common';
import { DoctorController } from './doctor.controller';
import { DoctorService } from './doctor.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Doctor } from 'src/entities/Doctor.entity';
import { User } from 'src/entities/User.entity';
import { DoctorAvailability } from 'src/entities/DoctorAvailability.entity';
import { DoctorAvailabilityController } from './doctor_availability.controller';
import { DoctorAvailabilityService } from './doctor_availability.service';
import { DoctorTimeSlotController } from './doctor_timeslot.controller';
import { DoctorTimeSlotService } from './doctor_timeslot.service';
import { DoctorTimeSlot } from 'src/entities/DoctorTimeSlot.entity';
import { Appointment } from 'src/appointment/entity/Appointment.entity';
import { SchedulingConflictService } from 'src/elasticScheduling/scheduling-conflict.service';
import { NotificationService } from 'src/common/notification/notification.service';
import { ScheduleAppointmentService } from 'src/appointment/schedule-appointment.service';
import { SuggestedSlotNotificationService } from 'src/common/notification/suggested-slot-notification.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Doctor,
      User,
      DoctorAvailability,
      DoctorTimeSlot,
      Appointment
    ])
  ],
  controllers: [DoctorController,DoctorAvailabilityController, DoctorTimeSlotController],
  providers: [DoctorService,
    DoctorAvailabilityService, 
    DoctorTimeSlotService,
    SchedulingConflictService,
    NotificationService,
    ScheduleAppointmentService,
    SuggestedSlotNotificationService,
  ],
  exports:[DoctorService,DoctorAvailabilityService, DoctorTimeSlotService]
})
export class DoctorModule {}
