import { Controller, Get } from '@nestjs/common';
import { AppConfigService } from './app-config.service';

@Controller('config')
export class AppConfigController {
  constructor(private appConfigService: AppConfigService) {}

  @Get()
  async getPublicConfig() {
    const [config, models, defaultModelId] = await Promise.all([
      this.appConfigService.getConfig(),
      this.appConfigService.getEnabledModels(),
      this.appConfigService.getDefaultModelId(),
    ]);

    return {
      success: true,
      data: {
        maxContextMessages: config.maxContextMessages,
        allowUserApiKeys: config.allowUserApiKeys,
        requireUserApiKey: config.requireUserApiKey,
        enforceUsageLimits: config.enforceUsageLimits,
        plusMonthlyUnits: config.plusMonthlyUnits,
        defaultModelId,
        models: models.map((m) => ({
          id: m.id,
          name: m.name,
          provider: m.provider,
          description: m.description,
        })),
      },
    };
  }
}
