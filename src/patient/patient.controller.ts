import { Body, Controller, Delete, Get, Param, Post, Put, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { PatientService } from './patient.service';
import { CreatePatientDTO } from './dto/createPatient.dto';
import { UpdatePatientDTO } from './dto/updatePatient.dto';

@Controller('patients')
export class PatientController {
    constructor(private readonly patientService: PatientService){}

    // @Post('/create-patient/:userId')
    // async createPatient(@Param('userId') userId:number ,@Body() dto:CreatePatientDTO){
    //     return this.patientService.createPatient(userId,dto);
    // }

    //List all the Patient
    @Get()
    async findAllPatients(){
        return this.patientService.findAll();
    }

    @Get('/:patientId')
    async findOne(@Param('patientID') patientId: number){
        return this.patientService.findOne(patientId);
    }

    @Put('/update-patient/:patientId')
    async updatePatientProfile(@Param('patientId') patientId : number, @Body() dto: UpdatePatientDTO){
        return this.patientService.update(patientId, dto);
    }

    @Delete('/:patientId')
    async removePatient(@Param('patientId') patientId: number){
        return this.patientService.remove(patientId);
    }
}
