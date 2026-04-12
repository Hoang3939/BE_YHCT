import { Body, Controller, Get, HttpCode, HttpStatus, Param, Patch } from '@nestjs/common';
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

  @Patch(':id/complete')
  @HttpCode(HttpStatus.OK)
  async complete(
    @Param('id') id: string,
    @Body() body: { storagePath?: string; status?: string; totalChunks?: number; errorMessage?: string },
  ) {
    const data = await this.pipelinesService.completePipeline(id, body);
    return { success: true, message: 'Pipeline updated.', data };
  }
}
