import { IsIn, IsOptional, IsString, MaxLength, Min } from 'class-validator';
import type { ContributionAssetType } from '../entities/contribution-asset.entity';

export class AddContributionAssetDto {
  @IsString()
  @MaxLength(500)
  originalFileName!: string;

  @IsString()
  storedFilePath!: string;

  @IsString()
  @MaxLength(100)
  mimeType!: string;

  @Min(1)
  fileSize!: number;

  @IsOptional()
  @IsString()
  @MaxLength(255)
  checksum?: string;

  @IsIn(['pdf', 'docx', 'image', 'zip', 'other'])
  assetType!: ContributionAssetType;
}
