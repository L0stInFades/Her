import { Module } from '@nestjs/common';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { EncryptionService } from '../../common/encryption.service';
import { AppConfigModule } from '../app-config/app-config.module';

@Module({
  imports: [AppConfigModule],
  controllers: [UsersController],
  providers: [UsersService, EncryptionService],
  exports: [UsersService],
})
export class UsersModule {}
