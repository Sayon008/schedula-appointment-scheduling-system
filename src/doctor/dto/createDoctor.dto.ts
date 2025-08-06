import { ArrayMinSize, IsArray, IsEnum, IsInt, IsNotEmpty, IsOptional, IsString, Min } from "class-validator";
import { Specialization } from "src/entities/Doctor.entity";

export class CreateDoctorDTO{
    @IsEnum(Specialization, {message:'Invalid Specialization provide.'})
    @IsNotEmpty({message: 'Specialization is required'})
    specialization:Specialization;

    @IsInt({message:'Years of experience must be an integer'})
    @Min(0,{message:'Years of experience cannot be neagtive'})
    @IsNotEmpty()
    years_of_exp:number;
}