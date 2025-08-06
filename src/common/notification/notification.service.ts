import { Injectable, Logger } from "@nestjs/common";
import { DoctorAvailability } from "src/entities/DoctorAvailability.entity";

@Injectable()
export class NotificationService {
    private readonly logger = new Logger(NotificationService.name);

    async sendAppointmentChangeNotification(
        toEmail : string,
        doctorName : string,
        message : string,
        originalApptTime : Date,
    ){
        this.logger.warn(
            `[NOTIFICATION MOCK] Sending email to ${toEmail} for doctor ${doctorName}. ` +
            `Original Appointment: ${originalApptTime.toLocaleString()}. Message: "${message}". `
        );
    }
}