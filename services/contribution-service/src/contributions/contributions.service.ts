import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { KnowledgeContribution } from './entities/knowledge-contribution.entity';
import { ReviewContributionDto } from './dto/review-contribution.dto';

@Injectable()
export class ContributionsService {
  constructor(
    @InjectRepository(KnowledgeContribution)
    private readonly contributionRepo: Repository<KnowledgeContribution>,
  ) {}

  async findAll(filters?: { status?: string }): Promise<KnowledgeContribution[]> {
    const query = this.contributionRepo
      .createQueryBuilder('c')
      .orderBy('c.createdAt', 'DESC');

    if (filters?.status) {
      query.andWhere('c.status = :status', { status: filters.status });
    }

    return query.getMany();
  }

  async findOne(id: string): Promise<KnowledgeContribution> {
    const contribution = await this.contributionRepo.findOne({
      where: { contributionId: id },
    });

    if (!contribution) {
      throw new NotFoundException(`Contribution ${id} not found`);
    }

    return contribution;
  }

  async review(
    id: string,
    reviewerId: string,
    dto: ReviewContributionDto,
  ): Promise<KnowledgeContribution> {
    const contribution = await this.findOne(id);

    contribution.status = dto.status;
    contribution.feedback = dto.feedback ?? null;
    contribution.reviewerId = reviewerId;
    contribution.reviewedAt = new Date();

    return this.contributionRepo.save(contribution);
  }
}
