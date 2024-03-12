import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service.js';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get('/ttfb')
  getTTFB(): Promise<string> {
    return this.appService.getTTFB();
  }

  @Get('/tti')
  getHello1(): Promise<string> {
    return this.appService.getTimeToInteractive();
  }
}
