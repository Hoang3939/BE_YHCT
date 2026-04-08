import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MulterModule } from '@nestjs/platform-express';
import { EbooksController } from './ebooks.controller';
import { EbooksService } from './ebooks.service';
import { Ebook } from './entities/ebook.entity';
import { DataPipeline } from '../pipelines/entities/data-pipeline.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Ebook, DataPipeline]),
    MulterModule.register({}),
  ],
  controllers: [EbooksController],
  providers: [EbooksService],
  exports: [EbooksService],
})
export class EbooksModule {}
