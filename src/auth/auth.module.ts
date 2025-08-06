import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from 'src/entities/User.entity';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { Doctor } from 'src/entities/Doctor.entity';
import { Patient } from 'src/entities/Patient.entity';

@Module({
  imports:[
    TypeOrmModule.forFeature([User, Doctor, Patient]),
    JwtModule.registerAsync({
      imports:[ConfigModule],
      inject:[ConfigService],
      useFactory:(configService: ConfigService) => ({
        secret: configService.get<string>('JWT_SECRET'),
        signOptions:{
          expiresIn: configService.get<string>('JWT_EXPIRES_IN','1h'),
        }
      })
    })
  ],
  controllers: [AuthController],
  providers: [AuthService],
  exports:[AuthService]
})
export class AuthModule {}
