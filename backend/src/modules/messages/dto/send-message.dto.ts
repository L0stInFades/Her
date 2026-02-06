import { IsString, IsUUID, MinLength, MaxLength, IsOptional } from 'class-validator';

export class SendMessageDto {
  @IsString()
  conversationId: string;

  @IsString()
  @MinLength(1)
  @MaxLength(32000)
  content: string;

  @IsOptional()
  @IsString()
  model?: string;
}
