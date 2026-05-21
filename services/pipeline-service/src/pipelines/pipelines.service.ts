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
  ) { }

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
        currentStep: pipeline.currentStep ?? null,
        workerId: workerString,
        docsProcessed: pipeline.status === 'completed' ? 1 : 0,
        docsTotal: 1,
        chunksGenerated: pipeline.ebook?.totalChunks || 0,
        createdAt: pipeline.createdAt,
        updatedAt: pipeline.updatedAt,
        backendStatus: pipeline.status,
        fileName: pipeline.fileName,
        errorMessage: pipeline.errorMessage,
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

    const finishedJobs = pipelines.filter(p => p.status === 'completed' && p.startedAt && p.completedAt);
    const avgTimeSeconds = finishedJobs.length > 0
      ? Math.round(finishedJobs.reduce((sum, p) => {
        return sum + (new Date(p.completedAt!).getTime() - new Date(p.startedAt!).getTime()) / 1000;
      }, 0) / finishedJobs.length)
      : 0;

    return {
      jobsToday,
      completed,
      failed,
      queued,
      chunksCreated,
      tokensProcessed: `${Math.round(chunksCreated * 1.5)}k`,
      avgTimeSeconds,
      successRate,
    };
  }

  async findLatestByContributionId(contributionId: string) {
    const pipeline = await this.pipelineRepo.findOne({
      where: { contributionId },
      order: { createdAt: 'DESC' },
    });

    if (!pipeline) {
      return null;
    }

    let frontendStatus = pipeline.status as string;
    let progress = pipeline.progress || 0;

    if (pipeline.status === 'completed') {
      frontendStatus = 'success';
      progress = 100;
    } else if (pipeline.status === 'pending_approval' || pipeline.status === 'pending') {
      frontendStatus = 'queued';
      progress = 0;
    } else if (pipeline.status === 'processing') {
      frontendStatus = 'running';
      progress = Math.max(1, pipeline.progress || 1);
    }

    return {
      id: pipeline.id,
      contributionId: pipeline.contributionId,
      processingType: pipeline.processingType,
      backendStatus: pipeline.status,
      status: frontendStatus,
      progress,
      fileName: pipeline.fileName,
      errorMessage: pipeline.errorMessage,
      createdAt: pipeline.createdAt,
      startedAt: pipeline.startedAt,
      completedAt: pipeline.completedAt,
      updatedAt: pipeline.updatedAt,
    };
  }

  async claimNextContributionJob() {
    const activeJob = await this.pipelineRepo.findOne({
      where: { status: 'processing' },
      order: { updatedAt: 'DESC' },
    });

    if (activeJob) {
      return null;
    }

    const pipeline = await this.pipelineRepo.findOne({
      where: {
        status: 'pending_approval',
        processingType: 'full_pipeline',
        contributionId: In(
          await this.pipelineRepo
            .createQueryBuilder('pipeline')
            .select('pipeline.contributionId')
            .where('pipeline.status = :status', { status: 'pending_approval' })
            .andWhere('pipeline.processingType = :processingType', { processingType: 'full_pipeline' })
            .andWhere('pipeline.contributionId IS NOT NULL')
            .getRawMany()
            .then((rows) => rows.map((row) => row.pipeline_contributionId).filter(Boolean)),
        ),
      },
      order: { createdAt: 'ASC' },
    });

    if (!pipeline || !pipeline.contributionId) {
      return null;
    }

    pipeline.status = 'processing';
    pipeline.progress = 1;
    pipeline.startedAt = new Date();
    pipeline.errorMessage = null;
    await this.pipelineRepo.save(pipeline);

    const contribution = await this.contributionRepo.findOne({
      where: { contributionId: pipeline.contributionId },
      relations: { assets: true },
    });

    if (!contribution) {
      pipeline.status = 'failed';
      pipeline.errorMessage = 'Contribution not found for claimed pipeline job.';
      await this.pipelineRepo.save(pipeline);
      throw new NotFoundException('Contribution not found for claimed pipeline job.');
    }

    const firstAsset = contribution.assets.find((asset) => asset.assetType === 'pdf') ?? contribution.assets[0] ?? null;

    if (!firstAsset) {
      pipeline.status = 'failed';
      pipeline.errorMessage = 'No contribution asset found for claimed pipeline job.';
      await this.pipelineRepo.save(pipeline);
      throw new BadRequestException('No contribution asset found for claimed pipeline job.');
    }

    return {
      pipelineId: pipeline.id,
      contributionId: contribution.contributionId,
      ebookId: pipeline.ebookId,
      fileName: firstAsset.originalFileName,
      storedFilePath: firstAsset.storedFilePath,
      assetType: firstAsset.assetType,
      mimeType: firstAsset.mimeType,
      status: pipeline.status,
    };
  }

  async queueApprovedContribution(contributionId: string, autoPublish = true) {
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

    // Create ebook from contribution data
    const ebook = this.ebookRepo.create({
      title: contribution.title,
      author: contribution.reference?.trim() || null,
      category: 'Y học cổ truyền',
      description: contribution.description?.trim() || null,
      storagePath: firstAsset.storedFilePath,
      totalChunks: 0,
      isPublished: false,
      autoPublish,
    } as any);
    const savedEbook = await this.ebookRepo.save(ebook) as any;

    // Update contribution with ebookId
    contribution.ebookId = savedEbook.id;
    await this.contributionRepo.save(contribution);

    const pipeline = this.pipelineRepo.create({
      ebookId: savedEbook.id,
      contributionId,
      processingType: 'full_pipeline',
      status: 'pending_approval',
      fileName: firstAsset.originalFileName,
      fileSize: firstAsset.fileSize,
      errorMessage: null,
      progress: 0,
      // currentStep removed
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
    body: {
      storagePath?: string;
      status?: string;
      totalChunks?: number;
      errorMessage?: string;
      progress?: number;
      currentStep?: string;
      startedAt?: string;
      completedAt?: string;
      autoPublish?: boolean;
    },
  ) {
    const pipeline = await this.pipelineRepo.findOne({
      where: { id },
      relations: ['ebook'],
    });
    if (!pipeline) throw new NotFoundException('Pipeline not found.');

    if (body.status) {
      pipeline.status = body.status as any;
    }
    if (typeof body.progress === 'number' && Number.isFinite(body.progress)) {
      pipeline.progress = Math.max(0, Math.min(100, Math.round(body.progress)));
    }
    if (body.errorMessage) {
      pipeline.errorMessage = body.errorMessage;
    }
    if (body.currentStep !== undefined) {
      pipeline.currentStep = body.currentStep;
    }
    if (body.startedAt) {
      pipeline.startedAt = new Date(body.startedAt);
    }
    if (body.completedAt) {
      pipeline.completedAt = new Date(body.completedAt);
    }

    if (body.status === 'processing') {
      pipeline.startedAt ??= new Date();
    }

    if (body.status === 'completed') {
      pipeline.progress = 100;
      pipeline.currentStep = null;
      pipeline.completedAt = body.completedAt ? new Date(body.completedAt) : new Date();

      // Auto-publish ebook when pipeline completes (if autoPublish flag set)
      if (pipeline.ebookId) {
        const ebook = await this.ebookRepo.findOne({ where: { id: pipeline.ebookId } });
        if (ebook && !(ebook as any).isPublished) {
          const shouldPublish = body.autoPublish !== false && (ebook as any).autoPublish !== false;
          if (shouldPublish) {
            (ebook as any).isPublished = true;
            await this.ebookRepo.save(ebook);
            console.log(`[INFO] Auto-published ebook ${ebook.id} after pipeline completion`);
          } else {
            console.log(`[INFO] Ebook ${ebook.id} pipeline completed — awaiting manual publish`);
          }
        }
      }
    }

    if (body.status === 'failed' && !pipeline.completedAt) {
      pipeline.completedAt = new Date();
    }

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
      progress: pipeline.progress,
      storagePath: body.storagePath || null,
    };
  }

  async deleteJob(id: string): Promise<void> {
    const pipeline = await this.pipelineRepo.findOne({ where: { id } });
    if (!pipeline) {
      throw new NotFoundException(`Pipeline job ${id} not found.`);
    }
    await this.pipelineRepo.remove(pipeline);
  }
}
