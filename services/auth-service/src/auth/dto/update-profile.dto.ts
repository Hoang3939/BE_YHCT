import { IsBoolean, IsOptional, IsString, MaxLength } from 'class-validator';

export class UpdateProfileDto {
  @IsOptional()
  @IsString()
  @MaxLength(255)
  fullName?: string;

  @IsOptional()
  @IsString()
  customInstructions?: string;

  @IsOptional()
  @IsBoolean()
  privacyMode?: boolean;

  @IsOptional()
  @IsBoolean()
  useMemory?: boolean;
}
