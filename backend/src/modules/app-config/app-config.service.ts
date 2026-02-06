import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

type Cached<T> = { value: T; expiresAt: number };

const CACHE_TTL_MS = 30_000;

@Injectable()
export class AppConfigService {
  private configCache: Cached<any> | null = null;
  private enabledModelsCache: Cached<any[]> | null = null;

  constructor(private prisma: PrismaService) {}

  private isValid(cache: Cached<unknown> | null) {
    return !!cache && cache.expiresAt > Date.now();
  }

  private async ensureDefaults() {
    await this.prisma.appConfig.upsert({
      where: { id: 'default' },
      create: {
        id: 'default',
        maxContextMessages: 50,
        allowUserApiKeys: true,
        requireUserApiKey: false,
        enforceUsageLimits: true,
        plusMonthlyUnits: 1000,
      },
      update: {},
    });

    const modelCount = await this.prisma.aiModel.count();
    if (modelCount > 0) return;

    await this.prisma.aiModel.createMany({
      data: [
        {
          id: 'openai/gpt-4o',
          name: 'GPT-4o',
          provider: 'OpenAI',
          description: 'Most capable model for complex tasks',
          enabled: true,
          isDefault: true,
        },
        {
          id: 'openai/gpt-4o-mini',
          name: 'GPT-4o Mini',
          provider: 'OpenAI',
          description: 'Fast and efficient for most tasks',
          enabled: true,
          isDefault: false,
        },
        {
          id: 'openai/gpt-4-turbo',
          name: 'GPT-4 Turbo',
          provider: 'OpenAI',
          description: 'Powerful model with larger context',
          enabled: true,
          isDefault: false,
        },
        {
          id: 'anthropic/claude-3-opus',
          name: 'Claude 3 Opus',
          provider: 'Anthropic',
          description: 'Most capable for complex analysis',
          enabled: true,
          isDefault: false,
        },
        {
          id: 'anthropic/claude-3-sonnet',
          name: 'Claude 3 Sonnet',
          provider: 'Anthropic',
          description: 'Balanced performance and speed',
          enabled: true,
          isDefault: false,
        },
        {
          id: 'anthropic/claude-3-haiku',
          name: 'Claude 3 Haiku',
          provider: 'Anthropic',
          description: 'Fastest for simple tasks',
          enabled: true,
          isDefault: false,
        },
      ],
      skipDuplicates: true,
    });
  }

  async getConfig() {
    if (this.isValid(this.configCache)) return this.configCache!.value;
    await this.ensureDefaults();
    const config = await this.prisma.appConfig.findUnique({ where: { id: 'default' } });
    this.configCache = { value: config, expiresAt: Date.now() + CACHE_TTL_MS };
    return config;
  }

  async getEnabledModels() {
    if (this.isValid(this.enabledModelsCache)) return this.enabledModelsCache!.value;
    await this.ensureDefaults();
    const models = await this.prisma.aiModel.findMany({
      where: { enabled: true },
      orderBy: [{ isDefault: 'desc' }, { provider: 'asc' }, { name: 'asc' }],
    });
    this.enabledModelsCache = { value: models, expiresAt: Date.now() + CACHE_TTL_MS };
    return models;
  }

  async getDefaultModelId() {
    const models = await this.getEnabledModels();
    return models.find((m) => m.isDefault)?.id || models[0]?.id || 'openai/gpt-4o';
  }

  clearCache() {
    this.configCache = null;
    this.enabledModelsCache = null;
  }
}
