import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ContributionsController } from './contributions.controller';
import { ContributionsService } from './contributions.service';
import { KnowledgeContribution } from './entities/knowledge-contribution.entity';

@Module({
  imports: [TypeOrmModule.forFeature([KnowledgeContribution])],
  controllers: [ContributionsController],
  providers: [ContributionsService],
  exports: [ContributionsService],
})
export class ContributionsModule {}
