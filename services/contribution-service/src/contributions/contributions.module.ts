import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from '../auth/auth.module';
import { ContributionsController } from './contributions.controller';
import { ContributionsService } from './contributions.service';
import { Account } from './entities/account.entity';
import { ContributionAsset } from './entities/contribution-asset.entity';
import { Expert } from './entities/expert.entity';
import { KnowledgeContribution } from './entities/knowledge-contribution.entity';
import { UserProfile } from './entities/user-profile.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      KnowledgeContribution,
      ContributionAsset,
      Expert,
      Account,
      UserProfile,
    ]),
    AuthModule,
  ],
  controllers: [ContributionsController],
  providers: [ContributionsService],
  exports: [ContributionsService],
})
export class ContributionsModule {}
