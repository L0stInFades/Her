import { Module } from '@nestjs/common';
import { ConversationsService } from './conversations.service';
import { ConversationsController } from './conversations.controller';
import { AppConfigModule } from '../app-config/app-config.module';

@Module({
  imports: [AppConfigModule],
  controllers: [ConversationsController],
  providers: [ConversationsService],
  exports: [ConversationsService],
})
export class ConversationsModule {}
