import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ContributionsModule } from './contributions/contributions.module';
import { FeedbacksModule } from './feedbacks/feedbacks.module';
import { KnowledgeContribution } from './contributions/entities/knowledge-contribution.entity';

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
      entities: [KnowledgeContribution],
      synchronize: false,
      options: {
        encrypt: true,
        trustServerCertificate: true,
      },
    }),
    ContributionsModule,
    FeedbacksModule,
  ],
})
export class AppModule {}
