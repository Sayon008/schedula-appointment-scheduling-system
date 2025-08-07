import { Controller, Get } from '@nestjs/common';
import { HelloService } from './hello.service';


@Controller()
export class HelloController {
  constructor(private readonly helloService: HelloService){}

  @Get('api/v1/hello')
  getHello(): string  {
    return this.helloService.getHello();
  }
}