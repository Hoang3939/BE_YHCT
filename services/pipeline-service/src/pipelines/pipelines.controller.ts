import { Body, Controller, Get, HttpCode, HttpStatus, Param, Patch, Post } from '@nestjs/common';
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

  @Post('contributions/:id/queue')
  @HttpCode(HttpStatus.OK)
  async queueContribution(@Param('id') id: string) {
    const data = await this.pipelinesService.queueApprovedContribution(id);
    return {
      success: true,
      message: 'Contribution queued for manual pipeline approval.',
      data,
    };
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
