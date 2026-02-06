import { Module } from '@nestjs/common';
import { MessagesService } from './messages.service';
import { MessagesController } from './messages.controller';
import { AiModule } from '../ai/ai.module';
import { UsersModule } from '../users/users.module';
import { AppConfigModule } from '../app-config/app-config.module';
import { UsageModule } from '../usage/usage.module';

@Module({
  imports: [AiModule, UsersModule, AppConfigModule, UsageModule],
  controllers: [MessagesController],
  providers: [MessagesService],
})
export class MessagesModule {}
