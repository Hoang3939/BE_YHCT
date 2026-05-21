import { IsIn, IsOptional, IsString, MaxLength } from 'class-validator';
import type { ContributionAssetType } from '../entities/contribution-asset.entity';

export class AddContributionAssetDto {
  @IsOptional()
  @IsString()
  @MaxLength(500)
  originalFileName?: string;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  mimeType?: string;

  @IsOptional()
  @IsString()
  @MaxLength(255)
  checksum?: string;

  @IsIn(['pdf', 'docx', 'image', 'zip', 'other'])
  assetType!: ContributionAssetType;
}
