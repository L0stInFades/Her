import { BadRequestException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../../prisma/prisma.service';
import { AppConfigService } from '../app-config/app-config.service';
import { UpdateAppConfigDto } from './dto/update-app-config.dto';
import { UpsertAiModelDto } from './dto/upsert-model.dto';

@Injectable()
export class AdminService {
  constructor(
    private prisma: PrismaService,
    private appConfigService: AppConfigService,
    private configService: ConfigService,
  ) {}

  async bootstrapAdmin(userId: string, token: string) {
    const expected = this.configService.get<string>('ADMIN_BOOTSTRAP_TOKEN');
    if (!expected) {
      throw new ForbiddenException('Bootstrap is not configured on server');
    }
    if (token !== expected) {
      throw new ForbiddenException('Invalid bootstrap token');
    }

    const adminCount = await this.prisma.user.count({ where: { role: 'ADMIN' } });
    if (adminCount > 0) {
      throw new ForbiddenException('An admin already exists');
    }

    const user = await this.prisma.user.update({
      where: { id: userId },
      data: { role: 'ADMIN' },
      select: { id: true, email: true, role: true },
    });

    return user;
  }

  async getConfig() {
    const config = await this.appConfigService.getConfig();
    const models = await this.prisma.aiModel.findMany({
      orderBy: [{ isDefault: 'desc' }, { provider: 'asc' }, { name: 'asc' }],
    });
    return { config, models };
  }

  async updateConfig(dto: UpdateAppConfigDto) {
    const nextRequireUserApiKey = dto.requireUserApiKey;
    const nextAllowUserApiKeys = dto.allowUserApiKeys;
    if (nextRequireUserApiKey === true && nextAllowUserApiKeys === false) {
      throw new BadRequestException('requireUserApiKey=true requires allowUserApiKeys=true');
    }

    const config = await this.prisma.appConfig.upsert({
      where: { id: 'default' },
      create: {
        id: 'default',
        maxContextMessages: dto.maxContextMessages ?? 50,
        allowUserApiKeys: dto.allowUserApiKeys ?? true,
        requireUserApiKey: dto.requireUserApiKey ?? false,
      },
      update: dto,
    });
    this.appConfigService.clearCache();
    return config;
  }

  async listModels() {
    return this.prisma.aiModel.findMany({
      orderBy: [{ isDefault: 'desc' }, { provider: 'asc' }, { name: 'asc' }],
    });
  }

  async upsertModel(dto: UpsertAiModelDto) {
    const enabled = dto.enabled ?? true;
    const isDefault = dto.isDefault ?? false;

    if (isDefault) {
      await this.prisma.aiModel.updateMany({
        where: { isDefault: true },
        data: { isDefault: false },
      });
    }

    const model = await this.prisma.aiModel.upsert({
      where: { id: dto.id },
      create: {
        id: dto.id,
        name: dto.name,
        provider: dto.provider,
        description: dto.description,
        enabled,
        isDefault,
      },
      update: {
        name: dto.name,
        provider: dto.provider,
        description: dto.description,
        enabled,
        isDefault,
      },
    });

    // Ensure at least one default enabled model exists
    if (!model.enabled && model.isDefault) {
      const next = await this.prisma.aiModel.findFirst({
        where: { enabled: true },
        orderBy: [{ updatedAt: 'desc' }],
      });
      if (next) {
        await this.prisma.aiModel.update({ where: { id: next.id }, data: { isDefault: true } });
      }
    }

    this.appConfigService.clearCache();
    return model;
  }

  async deleteModel(id: string) {
    const existing = await this.prisma.aiModel.findUnique({ where: { id } });
    if (!existing) throw new NotFoundException('Model not found');

    await this.prisma.aiModel.delete({ where: { id } });

    // If we deleted the default model, pick a new one
    if (existing.isDefault) {
      const next = await this.prisma.aiModel.findFirst({
        where: { enabled: true },
        orderBy: [{ updatedAt: 'desc' }],
      });
      if (next) {
        await this.prisma.aiModel.update({ where: { id: next.id }, data: { isDefault: true } });
      }
    }

    this.appConfigService.clearCache();
    return { success: true };
  }

  async setDefaultModel(id: string) {
    const model = await this.prisma.aiModel.findUnique({ where: { id } });
    if (!model) throw new NotFoundException('Model not found');
    if (!model.enabled) throw new BadRequestException('Cannot set a disabled model as default');

    await this.prisma.$transaction([
      this.prisma.aiModel.updateMany({ where: { isDefault: true }, data: { isDefault: false } }),
      this.prisma.aiModel.update({ where: { id }, data: { isDefault: true } }),
    ]);

    this.appConfigService.clearCache();
    return { success: true };
  }
}
