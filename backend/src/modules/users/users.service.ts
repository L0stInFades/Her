import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { EncryptionService } from '../../common/encryption.service';

@Injectable()
export class UsersService {
  constructor(
    private prisma: PrismaService,
    private encryptionService: EncryptionService,
  ) {}

  async findAll() {
    return this.prisma.user.findMany({
      select: {
        id: true,
        email: true,
        name: true,
        avatar: true,
        role: true,
        plan: true,
        isBanned: true,
        createdAt: true,
        updatedAt: true,
      },
    });
  }

  async findById(id: string) {
    const user = await this.prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        email: true,
        password: true,
        name: true,
        avatar: true,
        role: true,
        plan: true,
        isBanned: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!user) {
      return null;
    }

    return user;
  }

  async findByEmail(email: string) {
    const user = await this.prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      return null;
    }

    return user;
  }

  async create(data: { email: string; password: string; name?: string }) {
    return this.prisma.user.create({
      data: {
        email: data.email,
        password: data.password,
        name: data.name,
      },
    });
  }

  async update(id: string, data: { name?: string; avatar?: string }) {
    const user = await this.prisma.user.findUnique({
      where: { id },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return this.prisma.user.update({
      where: { id },
      data,
      select: {
        id: true,
        email: true,
        name: true,
        avatar: true,
        createdAt: true,
        updatedAt: true,
      },
    });
  }

  async delete(id: string) {
    const user = await this.prisma.user.findUnique({
      where: { id },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    await this.prisma.user.delete({
      where: { id },
    });

    return { success: true, message: 'User deleted successfully' };
  }

  async getUserSettings(userId: string) {
    const settings = await this.prisma.userSettings.findUnique({
      where: { userId },
    });

    if (!settings) {
      // Create default settings
      return this.prisma.userSettings.create({
        data: {
          userId,
          preferredModel: 'openai/gpt-4o',
          theme: 'light',
        },
      });
    }

    return settings;
  }

  async getUserSettingsDecrypted(userId: string) {
    const settings = await this.getUserSettings(userId);

    if (settings.openRouterApiKey) {
      try {
        return {
          ...settings,
          openRouterApiKey: this.encryptionService.decrypt(settings.openRouterApiKey),
        };
      } catch {
        // Key might not be encrypted (legacy data), return as-is
        return settings;
      }
    }

    return settings;
  }

  async getUserSettingsMasked(userId: string) {
    const settings = await this.getUserSettings(userId);

    let maskedKey: string | null = null;
    if (settings.openRouterApiKey) {
      try {
        const decrypted = this.encryptionService.decrypt(settings.openRouterApiKey);
        maskedKey = '****' + decrypted.slice(-4);
      } catch {
        // Legacy unencrypted key
        maskedKey = '****' + settings.openRouterApiKey.slice(-4);
      }
    }

    return {
      ...settings,
      openRouterApiKey: maskedKey,
    };
  }

  async updateUserSettings(
    userId: string,
    data: {
      openRouterApiKey?: string;
      preferredModel?: string;
      theme?: string;
    }
  ) {
    const updateData = { ...data };

    // Safety net: never store a masked key back to DB
    if (updateData.openRouterApiKey && updateData.openRouterApiKey.startsWith('****')) {
      delete updateData.openRouterApiKey;
    }

    // Encrypt API key before storage
    if (updateData.openRouterApiKey) {
      updateData.openRouterApiKey = this.encryptionService.encrypt(updateData.openRouterApiKey);
    }

    return this.prisma.userSettings.upsert({
      where: { userId },
      create: {
        userId,
        ...updateData,
      },
      update: updateData,
    });
  }
}
