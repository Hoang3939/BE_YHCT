import { IsIn, IsOptional, IsString, MinLength, ValidateIf } from 'class-validator';

export class ReviewContributionDto {
  @IsIn(['approved', 'rejected'])
  status!: 'approved' | 'rejected';

  @ValidateIf((dto: ReviewContributionDto) => dto.status === 'rejected')
  @IsString()
  @MinLength(5)
  @IsOptional()
  feedback?: string;
}
