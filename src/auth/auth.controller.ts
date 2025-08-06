import { Body, Controller, Post } from '@nestjs/common';
import { LoginDTO } from './dto/Login.dto';
import { AuthService } from './auth.service';
import { SignupDTO } from './dto/Signup.dto';

@Controller('auth')
export class AuthController {

    constructor(private readonly authService:AuthService){}

    @Post('signup')
    async signUp(@Body() signupDto: SignupDTO){
        return this.authService.signup(signupDto);
    }

    @Post('login')
    async login(@Body() loginDto: LoginDTO){
        return this.authService.login(loginDto);
    }

    @Post('logout')
    async logout(){
        return this.authService.logout();
    }
}
