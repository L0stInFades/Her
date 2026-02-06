import { IsBoolean, IsOptional, IsString, MaxLength } from 'class-validator';

export class UpsertAiModelDto {
  @IsString()
  @MaxLength(200)
  id: string;

  @IsString()
  @MaxLength(200)
  name: string;

  @IsString()
  @MaxLength(200)
  provider: string;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  description?: string;

  @IsOptional()
  @IsBoolean()
  enabled?: boolean;

  @IsOptional()
  @IsBoolean()
  isDefault?: boolean;
}

