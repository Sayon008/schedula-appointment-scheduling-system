import { Body, Controller, Delete, Get, Param, Post, Put, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { DoctorService } from './doctor.service';
import { UpdateDoctorDTO } from './dto/updateDoctor.dto';

@Controller('doctor')
export class DoctorController {

    constructor(private doctorService: DoctorService){}

    @Get()
    async getAllDoctors(){
        return this.doctorService.findAll();
    }

    @Get(':id')
    async getDoctorById(@Param('id') id:number){
        return this.doctorService.findById(id);
    }

    @Put(':id')
    async updateDoctor(
        @Param('id') id:number,
        @Body() updateDoctorDto: UpdateDoctorDTO
    ){
        return this.doctorService.update(id, updateDoctorDto);
    }

    @Delete(':id')
    async deleteDoctor(@Param('id') id: number){
        return this.doctorService.delete(id);
    }
}
