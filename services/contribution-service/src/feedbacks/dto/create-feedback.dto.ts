import { IsEmail, IsIn, IsOptional, IsString, MaxLength, MinLength } from 'class-validator';
import type { FeedbackCategory, FeedbackSeverity } from '../entities/feedback.entity';

export class CreateFeedbackDto {
  @IsIn(['bug', 'ux', 'content', 'feature_request', 'other'])
  category!: FeedbackCategory;

  @IsString()
  @MinLength(5)
  @MaxLength(255)
  title!: string;

  @IsString()
  @MinLength(10)
  content!: string;

  @IsOptional()
  @IsString()
  @MaxLength(255)
  fullName?: string;

  @IsOptional()
  @IsEmail()
  @MaxLength(255)
  email?: string;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  pageUrl?: string;

  @IsOptional()
  @IsIn(['low', 'medium', 'high'])
  severity?: FeedbackSeverity;
}
