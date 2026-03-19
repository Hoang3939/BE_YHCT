import { IsString, MinLength } from 'class-validator';

export class VerifyEmailQueryDto {
  @IsString()
  @MinLength(1)
  token: string;
}
