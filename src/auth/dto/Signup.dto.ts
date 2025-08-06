import { IsEmail, IsEnum, IsNotEmpty, MinLength, IsOptional, IsInt, IsString, Min, IsArray} from "class-validator";
import { Specialization } from "src/entities/Doctor.entity";
import { Sex } from "src/entities/Patient.entity";

export enum UserRole{
    PATIENT='patient',
    DOCTOR='doctor'
}

export class SignupDTO{

    @IsNotEmpty()
    first_name:string;

    @IsNotEmpty()
    last_name:string;

    @IsEmail()
    email:string;

    @MinLength(6)
    password:string;

    @IsEnum(UserRole)
    role:UserRole;

    // Create Doctors while signUp
    // Create Doctors while signUp
    // Doctor-specific fields
    @IsOptional()
    @IsEnum(Specialization)
    specialization?: Specialization;

    @IsOptional()
    @IsInt()

    @Min(4)
    years_of_exp?: number;


    // Patient-specific fields
    @IsOptional()
    @IsString()
    phone_number?: string;

    @IsOptional()
    @IsInt()
    @Min(0)
    age?: number;

    @IsOptional()
    @IsInt()
    @Min(0)
    weight?: number;

    @IsOptional()
    @IsEnum(Sex)
    sex?: Sex;
}