import { Controller, Get } from '@nestjs/common';

@Controller()
export class AppController {
  @Get()
  getWelcome() {
    return {
      message: 'Welcome to the EasyFashion API!',
      status: 'healthy',
      version: '1.0.0',
    };
  }
}
