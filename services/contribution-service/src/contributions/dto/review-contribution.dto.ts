import { IsIn, IsOptional, IsString } from 'class-validator';

export class ReviewContributionDto {
  @IsIn(['approved', 'rejected'])
  status!: 'approved' | 'rejected';

  @IsOptional()
  @IsString()
  feedback?: string;
}
