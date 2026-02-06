import { IsString, MinLength } from 'class-validator';

export class BootstrapAdminDto {
  @IsString()
  @MinLength(16)
  token: string;
}

