import { ConflictException, Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from 'src/entities/User.entity';
import { Repository } from 'typeorm';
import { SignupDTO, UserRole } from './dto/Signup.dto';
import * as bcrypt from 'bcrypt';
import { LoginDTO } from './dto/Login.dto';
import { Doctor, Specialization } from 'src/entities/Doctor.entity';
import { Patient } from 'src/entities/Patient.entity';

@Injectable()
export class AuthService {

    constructor(
        @InjectRepository(User) private readonly userRepo: Repository<User>,
        @InjectRepository(Doctor) private readonly doctorRepo: Repository<Doctor>,
        @InjectRepository(Patient) private readonly patientRepo: Repository<Patient>,
        private readonly jwtService: JwtService
    ){}

    async signup(signupDto: SignupDTO){
        const existing = await this.userRepo.findOne({where: {email : signupDto.email}});

        if(existing){
            throw new ConflictException("User with this emailId already exists!!, Please use a diffrerent email address");
        }

        const hashedPassword = await bcrypt.hash(signupDto.password,10);
        const user = this.userRepo.create({
            email:signupDto.email,
            password:hashedPassword,
            role:signupDto.role,
            first_name:signupDto.first_name,
            last_name:signupDto.last_name,
        });

        await this.userRepo.save(user);

        // Create role-specific record based on user role
        if(signupDto.role === UserRole.DOCTOR){
            const doctor = new Doctor();
            doctor.specialization =signupDto.specialization ?? Specialization.GENERAL_MEDICINE;
            doctor.years_of_exp = signupDto.years_of_exp ?? 1;
            doctor.user = user;

            await this.doctorRepo.save(doctor);

        } 
        
        else if(signupDto.role === UserRole.PATIENT){

            const patient = new Patient();
            patient.phone_number = signupDto.phone_number || null;
            patient.age = signupDto.age || null;
            patient.weight = signupDto.weight || null;
            patient.sex = signupDto.sex || null;

            patient.user = user;

            await this.patientRepo.save(patient);
        }

        return {message: 'SignUp Successful', userId: user.user_id};
    }


    async login(logingDto: LoginDTO):Promise<{user:Partial<User>; token:string}>{
        const user = await this.userRepo.findOne({where: {email:logingDto.email}});

        if(!user || !(await bcrypt.compare(logingDto.password, user.password))){
            throw new UnauthorizedException('Invalid emailId or password!');
        }

        
        const token = this.generateJwtToken(user);

        const{ password: _, ...result} = user;
        return {user:result, token};
    }

    private generateJwtToken(user:User): string{
        const payload = {sub: user.user_id, email:user.email, role: user.role};
        return this.jwtService.sign(payload);
    }

    async logout(): Promise<{message: string}>{
        // For stateless JWTs, logout is typically handled client-side by discarding the token.
        // Here, we just return a success message
        return {message: ' Logout Successful'};
    }
}
