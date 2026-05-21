import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
} from '@nestjs/common';
import { PipelinesService } from './pipelines.service';

@Controller('pipelines')
export class PipelinesController {
  constructor(private readonly pipelinesService: PipelinesService) { }

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

  @Get('contributions/:id/latest')
  async getLatestContributionPipeline(@Param('id') id: string) {
    const data = await this.pipelinesService.findLatestByContributionId(id);
    return { success: true, data };
  }

  @Post('contributions/:id/queue')
  @HttpCode(HttpStatus.OK)
  async queueContribution(
    @Param('id') id: string,
    @Body() body?: { autoPublish?: boolean },
  ) {
    const data = await this.pipelinesService.queueApprovedContribution(
      id,
      body?.autoPublish !== false,
    );
    return {
      success: true,
      message: 'Contribution queued for manual pipeline approval.',
      data,
    };
  }

  @Post('claim-next')
  @HttpCode(HttpStatus.OK)
  async claimNext() {
    const data = await this.pipelinesService.claimNextContributionJob();
    return {
      success: true,
      message: data
        ? 'Claimed next contribution pipeline job.'
        : 'No pending contribution pipeline job available.',
      data,
    };
  }

  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  async deleteJob(@Param('id') id: string) {
    await this.pipelinesService.deleteJob(id);
    return { success: true, message: 'Pipeline job deleted.' };
  }

  @Patch(':id/complete')
  @HttpCode(HttpStatus.OK)
  async complete(
    @Param('id') id: string,
    @Body()
    body: {
      storagePath?: string;
      status?: string;
      totalChunks?: number;
      errorMessage?: string;
      progress?: number;
      currentStep?: string;
      startedAt?: string;
      completedAt?: string;
    },
  ) {
    const data = await this.pipelinesService.completePipeline(id, body);
    return { success: true, message: 'Pipeline updated.', data };
  }
}
