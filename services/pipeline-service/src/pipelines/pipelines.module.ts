import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DataPipeline } from './entities/data-pipeline.entity';
import { Ebook } from './entities/ebook.entity';
import { PipelinesController } from './pipelines.controller';
import { PipelinesService } from './pipelines.service';

@Module({
  imports: [TypeOrmModule.forFeature([DataPipeline, Ebook])],
  controllers: [PipelinesController],
  providers: [PipelinesService],
})
export class PipelinesModule {}
