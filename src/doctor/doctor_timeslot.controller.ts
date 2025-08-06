import { Body, Controller, Delete, Get, Param, ParseIntPipe, Patch, Post, Put } from "@nestjs/common";
import { DoctorTimeSlotService } from "./doctor_timeslot.service";
import { CreateDoctorTimeSlotDTO } from "./dto/createDoctorTimeSlot.dto";
import { UpdateDoctorTimeSlotDTO } from "./dto/updateDoctorTimeSlot.dto";

@Controller('doctor-timeslot')
export class DoctorTimeSlotController{
    constructor(private readonly timeSlotService:DoctorTimeSlotService){}

    @Post('/:availabilityId')
    async create(@Param('availabilityId', ParseIntPipe) availabilityId:number, @Body() dto: CreateDoctorTimeSlotDTO){
        return this.timeSlotService.createTimeSlot(availabilityId, dto);
    }

    @Get('/availability/:availabilityId')
    async findAllSlots(@Param('availabilityId',  ParseIntPipe) availabilityId : number){
        return this.timeSlotService.findAll(availabilityId);
    }

    @Get('/availability/:doctorId')
    async findAllSlotByDoctorId(@Param('doctorId', ParseIntPipe) doctorId: number){
        return this.timeSlotService.findAllSlotsByDoctorId(doctorId);
    }

    @Put('/:slotId')
    async updateSlot(@Param('slotId', ParseIntPipe) slotId: number, @Body() dto:UpdateDoctorTimeSlotDTO){
        return this.timeSlotService.updateTimeSlot(slotId, dto);
    }

    @Delete('/:slotId')
    async deleteSlot(@Param('slotId', ParseIntPipe) slotId: number){
        return this.timeSlotService.delete(slotId);
    }

    @Patch('/shrink/:doctorId/:date')
    async shrinkSlots(
        @Param('doctorId', ParseIntPipe) doctorId:number, 
        @Param('date') date:string,
        @Body() body : {newStartTime:string, newEndTime:string}
    ){

        const {newStartTime, newEndTime} = body;
        return this.timeSlotService.shrinkSlotsForDate(doctorId, date, newStartTime, newEndTime);
    }

}