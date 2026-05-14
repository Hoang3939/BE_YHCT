import { BadRequestException, ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { ContributionAsset } from './entities/contribution-asset.entity';
import { DataPipeline } from './entities/data-pipeline.entity';
import { Ebook } from './entities/ebook.entity';
import { KnowledgeContribution } from './entities/knowledge-contribution.entity';

@Injectable()
export class PipelinesService {
  constructor(
    @InjectRepository(DataPipeline)
    private readonly pipelineRepo: Repository<DataPipeline>,
    @InjectRepository(Ebook)
    private readonly ebookRepo: Repository<Ebook>,
    @InjectRepository(KnowledgeContribution)
    private readonly contributionRepo: Repository<KnowledgeContribution>,
    @InjectRepository(ContributionAsset)
    private readonly contributionAssetRepo: Repository<ContributionAsset>,
  ) {}

  async findAll() {
    const pipelines = await this.pipelineRepo.find({
      relations: ['ebook'],
      order: { createdAt: 'DESC' },
    });
    const contributionIds = pipelines
      .map((pipeline) => pipeline.contributionId)
      .filter((value): value is string => Boolean(value));

    const contributions = contributionIds.length
      ? await this.contributionRepo.find({
          where: { contributionId: In(contributionIds) },
        })
      : [];
    const contributionMap = new Map(
      contributions.map((contribution) => [contribution.contributionId, contribution]),
    );

    return pipelines.map((pipeline) => {
      let progress = pipeline.progress || 0;
      let frontendStatus = pipeline.status as string;

      if (pipeline.status === 'completed') {
        progress = 100;
        frontendStatus = 'success';
      } else if (pipeline.status === 'pending_approval' || pipeline.status === 'pending') {
        progress = 0;
        frontendStatus = 'queued';
      } else if (pipeline.status === 'processing') {
        frontendStatus = 'running';
      }

      const numericId = parseInt(pipeline.id.substring(0, 4), 16);
      const workerString = `worker-${(numericId % 9) + 1}`;
      const relatedContribution = pipeline.contributionId
        ? contributionMap.get(pipeline.contributionId)
        : null;

      let typeLabel = 'manual';
      if (pipeline.processingType === 'full_pipeline') {
        typeLabel = pipeline.contributionId ? 'contribution_queue' : 'batch_import';
      }

      return {
        id: pipeline.id,
        name: pipeline.ebook?.title || relatedContribution?.title || 'Unknown Pipeline Job',
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

  async queueApprovedContribution(contributionId: string) {
    const contribution = await this.contributionRepo.findOne({
      where: { contributionId },
    });
    if (!contribution) {
      throw new NotFoundException('Contribution not found.');
    }
    if (contribution.status !== 'approved') {
      throw new BadRequestException('Only approved contributions can be queued for pipeline.');
    }

    const existingJob = await this.pipelineRepo.findOne({
      where: [
        { contributionId, status: 'pending_approval' },
        { contributionId, status: 'pending' },
        { contributionId, status: 'processing' },
      ],
      order: { createdAt: 'DESC' },
    });
    if (existingJob) {
      return {
        pipelineId: existingJob.id,
        status: existingJob.status,
        contributionId,
      };
    }

    const firstAsset = await this.contributionAssetRepo.findOne({
      where: { contributionId },
      order: { createdAt: 'ASC' },
    });
    if (!firstAsset) {
      throw new BadRequestException('Approved contribution must have at least one asset to queue pipeline.');
    }

    const pipeline = this.pipelineRepo.create({
      ebookId: null,
      contributionId,
      processingType: 'full_pipeline',
      status: 'pending_approval',
      fileName: firstAsset.originalFileName,
      fileSize: firstAsset.fileSize,
      errorMessage: null,
      progress: 0,
      startedAt: null,
      completedAt: null,
    });

    const savedPipeline = await this.pipelineRepo.save(pipeline);
    return {
      pipelineId: savedPipeline.id,
      status: savedPipeline.status,
      contributionId,
    };
  }

  async completePipeline(
    id: string,
    body: { storagePath?: string; status?: string; totalChunks?: number; errorMessage?: string },
  ) {
    const pipeline = await this.pipelineRepo.findOne({
      where: { id },
      relations: ['ebook'],
    });
    if (!pipeline) throw new NotFoundException('Pipeline not found.');

    // Update pipeline status
    pipeline.status = (body.status as any) || 'completed';
    if (body.errorMessage) pipeline.errorMessage = body.errorMessage;
    if (body.status === 'completed') pipeline.progress = 100;

    await this.pipelineRepo.save(pipeline);

    // Update ebook storagePath and totalChunks if provided
    if (pipeline.ebookId && (body.storagePath || body.totalChunks)) {
      const ebook = await this.ebookRepo.findOne({ where: { id: pipeline.ebookId } });
      if (ebook) {
        if (body.storagePath) ebook.storagePath = body.storagePath;
        if (body.totalChunks) ebook.totalChunks = body.totalChunks;
        await this.ebookRepo.save(ebook);
      }
    }

    return {
      pipelineId: pipeline.id,
      status: pipeline.status,
      storagePath: body.storagePath || null,
    };
  }
}

