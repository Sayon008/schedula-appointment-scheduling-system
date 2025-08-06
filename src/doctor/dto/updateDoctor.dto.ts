import { ArrayNotEmpty, ArrayUnique, IsArray, IsEnum, IsInt, IsNotEmpty, IsOptional } from "class-validator";
import { Specialization } from "src/entities/Doctor.entity";

export class UpdateDoctorDTO{
    @IsOptional()
    @IsEnum(Specialization)
    specialization?: Specialization;

    @IsOptional()
    @IsInt()
    years_of_exp?: number;
}