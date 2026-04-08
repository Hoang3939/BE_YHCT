import { Controller, Get } from '@nestjs/common';
import { PipelinesService } from './pipelines.service';

@Controller('pipelines')
export class PipelinesController {
  constructor(private readonly pipelinesService: PipelinesService) {}

  @Get()
  async getJobs() {
    const data = await this.pipelinesService.findAll();
    return { success: true, data };
  }

  @Get('stats')
  async getStats() {
    const data = await this.pipelinesService.getStats();
    return { success: true, data };
  }
}
