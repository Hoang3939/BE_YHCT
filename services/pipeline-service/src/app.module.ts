import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PipelinesModule } from './pipelines/pipelines.module';
import { ContributionAsset } from './pipelines/entities/contribution-asset.entity';
import { DataPipeline } from './pipelines/entities/data-pipeline.entity';
import { Ebook } from './pipelines/entities/ebook.entity';
import { KnowledgeContribution } from './pipelines/entities/knowledge-contribution.entity';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    TypeOrmModule.forRoot({
      type: 'mssql',
      host: process.env.DB_HOST ?? '',
      port: Number(process.env.DB_PORT ?? 1433),
      username: process.env.DB_USERNAME ?? '',
      password: process.env.DB_PASSWORD ?? '',
      database: process.env.DB_NAME ?? 'YHCT_DB',
      entities: [DataPipeline, Ebook, KnowledgeContribution, ContributionAsset],
      synchronize: false,
      options: {
        encrypt: true,
        trustServerCertificate: true,
      },
    }),
    PipelinesModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
