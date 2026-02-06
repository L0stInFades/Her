import {
  Controller,
  Get,
  Patch,
  UseGuards,
  Body,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { GetUser } from '../auth/decorators/get-user.decorator';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { UpdateSettingsDto } from './dto/update-settings.dto';

@UseGuards(JwtAuthGuard)
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get('profile')
  async getProfile(@GetUser() user: any) {
    return {
      success: true,
      data: {
        id: user.id,
        email: user.email,
        name: user.name,
        avatar: user.avatar,
        createdAt: user.createdAt,
      },
    };
  }

  @Patch('profile')
  async updateProfile(@GetUser() user: any, @Body() body: UpdateProfileDto) {
    const updated = await this.usersService.update(user.id, {
      name: body.name,
    });
    return {
      success: true,
      data: updated,
    };
  }

  @Get('settings')
  async getSettings(@GetUser() user: any) {
    const settings = await this.usersService.getUserSettingsMasked(user.id);
    return {
      success: true,
      data: {
        openRouterApiKey: settings.openRouterApiKey,
        preferredModel: settings.preferredModel,
        theme: settings.theme,
      },
    };
  }

  @Patch('settings')
  async updateSettings(@GetUser() user: any, @Body() body: UpdateSettingsDto) {
    const settings = await this.usersService.updateUserSettings(user.id, body);
    return {
      success: true,
      data: {
        openRouterApiKey: settings.openRouterApiKey ? '****' + settings.openRouterApiKey.slice(-4) : null,
        preferredModel: settings.preferredModel,
        theme: settings.theme,
      },
    };
  }
}
