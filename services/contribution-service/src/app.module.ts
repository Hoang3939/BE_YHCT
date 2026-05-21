import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ContributionsModule } from './contributions/contributions.module';
import { Account } from './contributions/entities/account.entity';
import { ContributionAsset } from './contributions/entities/contribution-asset.entity';
import { Expert } from './contributions/entities/expert.entity';
import { KnowledgeContribution } from './contributions/entities/knowledge-contribution.entity';
import { UserProfile } from './contributions/entities/user-profile.entity';
import { FeedbacksModule } from './feedbacks/feedbacks.module';
import { FeedbackEntity } from './feedbacks/entities/feedback.entity';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['.env', '../../.env'],
    }),
    TypeOrmModule.forRoot({
      type: 'mssql',
      host: process.env.DB_HOST ?? '',
      port: Number(process.env.DB_PORT ?? 1433),
      username: process.env.DB_USERNAME ?? '',
      password: process.env.DB_PASSWORD ?? '',
      database: process.env.DB_NAME ?? 'YHCT_DB',
      entities: [KnowledgeContribution, ContributionAsset, Expert, Account, UserProfile, FeedbackEntity],
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
export class AppModule { }
