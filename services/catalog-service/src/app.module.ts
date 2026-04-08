import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EbooksModule } from './ebooks/ebooks.module';
import { PipelinesModule } from './pipelines/pipelines.module';
import { Ebook } from './ebooks/entities/ebook.entity';
import { DataPipeline } from './pipelines/entities/data-pipeline.entity';

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
      entities: [Ebook, DataPipeline],
      synchronize: false,
      options: {
        encrypt: true,
        trustServerCertificate: true,
      },
    }),
    EbooksModule,
    PipelinesModule,
  ],
})
export class AppModule {}
