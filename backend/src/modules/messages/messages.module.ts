import { Module } from '@nestjs/common';
import { MessagesService } from './messages.service';
import { MessagesController } from './messages.controller';
import { AiModule } from '../ai/ai.module';
import { UsersModule } from '../users/users.module';
import { AppConfigModule } from '../app-config/app-config.module';

@Module({
  imports: [AiModule, UsersModule, AppConfigModule],
  controllers: [MessagesController],
  providers: [MessagesService],
})
export class MessagesModule {}
