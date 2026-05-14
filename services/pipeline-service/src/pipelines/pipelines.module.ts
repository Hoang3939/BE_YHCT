import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ContributionAsset } from './entities/contribution-asset.entity';
import { DataPipeline } from './entities/data-pipeline.entity';
import { Ebook } from './entities/ebook.entity';
import { KnowledgeContribution } from './entities/knowledge-contribution.entity';
import { PipelinesController } from './pipelines.controller';
import { PipelinesService } from './pipelines.service';

@Module({
  imports: [TypeOrmModule.forFeature([DataPipeline, Ebook, KnowledgeContribution, ContributionAsset])],
  controllers: [PipelinesController],
  providers: [PipelinesService],
})
export class PipelinesModule {}
