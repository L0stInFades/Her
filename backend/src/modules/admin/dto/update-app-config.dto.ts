import { IsBoolean, IsInt, IsOptional, Max, Min } from 'class-validator';

export class UpdateAppConfigDto {
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(200)
  maxContextMessages?: number;

  @IsOptional()
  @IsBoolean()
  allowUserApiKeys?: boolean;

  @IsOptional()
  @IsBoolean()
  requireUserApiKey?: boolean;

  @IsOptional()
  @IsBoolean()
  enforceUsageLimits?: boolean;

  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(100000000)
  plusMonthlyUnits?: number;
}
