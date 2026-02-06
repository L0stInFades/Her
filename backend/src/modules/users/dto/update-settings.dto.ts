import { IsOptional, IsString, MaxLength } from 'class-validator';

export class UpdateSettingsDto {
  @IsOptional()
  @IsString()
  @MaxLength(500)
  openRouterApiKey?: string;

  @IsOptional()
  @IsString()
  preferredModel?: string;

  @IsOptional()
  @IsString()
  theme?: string;
}
