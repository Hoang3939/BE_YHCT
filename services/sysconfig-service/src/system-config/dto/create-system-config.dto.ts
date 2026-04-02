import { IsString, IsNotEmpty, IsOptional, IsBoolean } from 'class-validator';

export class CreateSystemConfigDto {
  @IsString()
  @IsNotEmpty()
  configKey!: string;

  @IsString()
  @IsNotEmpty()
  configValue!: string;

  @IsString()
  @IsOptional()
  configType?: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsBoolean()
  @IsOptional()
  isEditable?: boolean = true;

  @IsBoolean()
  @IsOptional()
  isActive?: boolean = true;
}