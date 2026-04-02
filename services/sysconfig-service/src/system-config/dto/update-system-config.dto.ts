import { PartialType } from '@nestjs/mapped-types';
import { CreateSystemConfigDto } from './create-system-config.dto';
import { IsString, IsOptional } from 'class-validator';

export class UpdateSystemConfigDto extends PartialType(CreateSystemConfigDto) {
  @IsString()
  @IsOptional()
  lastModifiedByAdminId?: string;
}
