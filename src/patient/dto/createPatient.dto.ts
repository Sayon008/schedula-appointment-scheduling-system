import {IsEnum, IsInt, IsOptional, IsPhoneNumber } from "class-validator";
import { Sex } from "src/entities/Patient.entity";

export class CreatePatientDTO{

    @IsOptional()
    @IsPhoneNumber('IN')
    phone_number?:string;

    @IsOptional()
    @IsInt()
    age?:number

    @IsOptional()
    @IsEnum(Sex)
    sex?: Sex;

    @IsOptional()
    @IsInt()
    weight?: number
}