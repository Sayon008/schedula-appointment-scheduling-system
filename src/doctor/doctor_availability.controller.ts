import { Body, Controller, Delete, Get, Param, Post, Put } from '@nestjs/common';
import { CreateDoctorAvailabilityDTO } from './dto/createDoctorAvailability.dto';
import { UpdateDoctorAvailabilityDTO } from './dto/updateDoctorAvailability.dto';
import { DoctorAvailabilityService } from './doctor_availability.service';



@Controller('doctor-availability')
export class DoctorAvailabilityController {
    constructor(
        private readonly availabilityService: DoctorAvailabilityService
    ){}

    @Post('/create-availability/:doctorId')
    create(@Param('doctorId') doctorId: number,@Body() dto:CreateDoctorAvailabilityDTO){
        return this.availabilityService.create(doctorId, dto);
    }

    @Get('/:doctorId')
    findAll(@Param('doctorId') doctorId:number){
        return this.availabilityService.findAll(doctorId);
    }

    @Put('/update-availability/:availabilityId')
    update(
        @Param('availabilityId') availabilityId:number,
        @Body() dto:UpdateDoctorAvailabilityDTO
    ){
        return this.availabilityService.update(availabilityId, dto);
    }

    @Delete('/:availabilityId')
    remove(@Param('availabilityId') availabilityId:number){
        return this.availabilityService.delete(availabilityId);
    }
}
