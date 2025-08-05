// src/app.controller.ts
import { Controller, Get } from '@nestjs/common';
import { Public } from './decorators/public.decorator';

@Controller()
export class AppController {
  @Public()
  @Get('ping')
  getPing() {
    return { message: 'pong' };
  }
}
