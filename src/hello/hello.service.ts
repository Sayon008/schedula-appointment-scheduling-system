import { Injectable } from "@nestjs/common";

@Injectable()
export class HelloService{
    getHello():string{
        return 'Hello World! From Render Deployment, Our First Deploymnet of project';
    }
}