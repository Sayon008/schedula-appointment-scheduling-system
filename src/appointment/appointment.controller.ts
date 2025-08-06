import { Body, Controller, Delete, Get, HttpCode, HttpStatus, Param, ParseIntPipe, Post, Put, Query, UsePipes, ValidationPipe } from '@nestjs/common';
import { AppointmentService } from './appointment.service';
import { CreateAppointmentDTO } from './dto/createAppointment.dto';
import { formatTime } from 'src/common/utils/date-format.util';
import { UpdateAppointmentDTO } from './dto/updateAppointment.dto';
import { ScheduleAppointmentService } from './schedule-appointment.service';

@Controller('appointments')
export class AppointmentController {
    constructor(
        private readonly appointmentService: AppointmentService,
        private readonly scheduleAppointmentService : ScheduleAppointmentService
    ){}

    @Post()
    @HttpCode(HttpStatus.CREATED)
    async createAppointment(@Body() dto: CreateAppointmentDTO){
        const appointment = await this.appointmentService.createAppointment(dto);
        return{
            ...appointment,
            appointment_time: formatTime(new Date(dto.appointment_time)),
        };
    }

    @Get()
    @HttpCode(HttpStatus.OK)
    async findAllApointments(
        @Query('doctorId', new ParseIntPipe({optional : true})) doctorId: number,
        @Query('patientId', new ParseIntPipe({optional:true})) patientId : number
    ){
        return this.appointmentService.findAllApointments(doctorId, patientId);
    }

    @Get('/:appointmentId')
    @HttpCode(HttpStatus.OK)
    async findAppointmentById(@Param('appointmentId') appointmentId:number){
        return this.appointmentService.findAppointementById(appointmentId);
    }

    @Put('/update-appointments/:appointmentId')
    @HttpCode(HttpStatus.CREATED)
    async updateAppointment(@Param('appointmentId') appointmentId:number, @Body() dto:UpdateAppointmentDTO){
        return this.appointmentService.updateAppoinment(appointmentId, dto);
    }

    @Put('/:appointmentId/cancel')
    async cancelAppointment(@Param('appointmentId') appointmnetId:number){
        return this.appointmentService.cancelAppointment(appointmnetId);
    }


    @Delete('/:appointmentId')
    @HttpCode(HttpStatus.NO_CONTENT)
    async deleteAppointment(@Param('appointmentId') appointmnetId: number){
        return this.appointmentService.deleteAppointment(appointmnetId);
    }

    @Post('/:appointmentId/accept-suggested-slot')
    async acceptSuggestedSlot(
        @Param('appointmentId') appointmentId:number, 
        @Body() body: {slotId: number, newStartTime:string, newEndTime: string}
    ){

        return this.scheduleAppointmentService.acceptSuggestedSlot(
            +appointmentId,
            body.slotId,
            body.newStartTime,
            body.newEndTime
        );
    }

    @Post(':id/reschedule')
    async rescheduleAppointment(@Param('id') id: number, @Body() body: { slotId: number }) {
        return this.scheduleAppointmentService.rescheduleAppointment(+id, body.slotId);
    }
}
