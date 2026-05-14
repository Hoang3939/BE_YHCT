import { IsIn, IsOptional, IsString, MaxLength, MinLength } from 'class-validator';
import type { ContributionType } from '../entities/knowledge-contribution.entity';

export class CreateContributionDto {
  @IsString()
  @MinLength(5)
  @MaxLength(500)
  title!: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsIn(['medicine', 'herb', 'document'])
  contributionType!: ContributionType;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  reference?: string;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  filePath?: string;
}
