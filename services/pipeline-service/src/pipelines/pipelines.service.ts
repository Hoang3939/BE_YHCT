import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { DataPipeline } from './entities/data-pipeline.entity';

@Injectable()
export class PipelinesService {
  constructor(
    @InjectRepository(DataPipeline)
    private readonly pipelineRepo: Repository<DataPipeline>,
  ) {}

  async findAll() {
    const pipelines = await this.pipelineRepo.find({
      relations: ['ebook'],
      order: { createdAt: 'DESC' },
    });

    return pipelines.map(pipeline => {
      // Tính toán progress giả lập nếu status chưa phù hợp
      let progress = pipeline.progress || 0;
      let frontendStatus = pipeline.status as any;
      
      // Mapping pipeline status to Frontend job status
      if (pipeline.status === 'completed') {
        progress = 100;
        frontendStatus = 'success';
      } else if (pipeline.status === 'pending_approval' || pipeline.status === 'pending') {
        progress = 0;
        frontendStatus = 'queued';
      } else if (pipeline.status === 'processing') {
        frontendStatus = 'running';
      }

      // Generate a deterministic worker ID based on UUID so it doesn't jump
      const numericId = parseInt(pipeline.id.substring(0, 4), 16);
      const workerString = `worker-${(numericId % 9) + 1}`;

      // Map processingType
      let typeLabel = 'manual';
      if (pipeline.processingType === 'full_pipeline') typeLabel = 'batch_import';

      return {
        id: pipeline.id,
        name: pipeline.ebook?.title || 'Unknown Ebook',
        type: typeLabel,
        status: frontendStatus,
        progress,
        workerId: workerString,
        docsProcessed: pipeline.status === 'completed' ? 1 : 0,
        docsTotal: 1,
        chunksGenerated: pipeline.ebook?.totalChunks || 0,
        createdAt: pipeline.createdAt,
      };
    });
  }

  async getStats() {
    const pipelines = await this.pipelineRepo.find({ relations: ['ebook'] });
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const jobsToday = pipelines.filter(p => new Date(p.createdAt) >= today).length;
    const completed = pipelines.filter(p => p.status === 'completed').length;
    const failed = pipelines.filter(p => p.status === 'failed').length;
    const queued = pipelines.filter(p => p.status === 'pending_approval' || p.status === 'pending').length;
    
    const chunksCreated = pipelines.reduce((sum, p) => sum + (p.ebook?.totalChunks || 0), 0);
    const successRate = pipelines.length > 0 ? Math.round((completed / pipelines.length) * 100) : 100;

    return {
      jobsToday,
      completed,
      failed,
      queued,
      chunksCreated,
      tokensProcessed: `${Math.round(chunksCreated * 1.5)}k`,
      avgTimeSeconds: 45, // mock for now
      successRate,
    };
  }
}
