import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { AppConfigService } from '../app-config/app-config.service';

function currentPeriodUtc(d = new Date()) {
  const y = d.getUTCFullYear();
  const m = String(d.getUTCMonth() + 1).padStart(2, '0');
  return `${y}-${m}`;
}

function estimateTokens(text: string) {
  // Cheap estimator: ~4 bytes/token. Works "ok-ish" across mixed languages.
  const bytes = Buffer.byteLength(text || '', 'utf8');
  return Math.max(1, Math.ceil(bytes / 4));
}

export type UsageSnapshot = {
  period: string;
  plan: 'ART' | 'PRO_ART';
  monthlyUnitLimit: number;
  unitsUsed: number;
  requestsUsed: number;
  estimatedTokensUsed: number;
};

@Injectable()
export class UsageService {
  constructor(
    private prisma: PrismaService,
    private appConfigService: AppConfigService,
  ) {}

  private planMultiplier(plan: 'ART' | 'PRO_ART') {
    // Requirement:
    // Art = GPT Plus * 2
    // ProArt = Art * 4 = GPT Plus * 8
    return plan === 'PRO_ART' ? 8 : 2;
  }

  async getSnapshot(userId: string): Promise<UsageSnapshot> {
    const [config, user] = await Promise.all([
      this.appConfigService.getConfig(),
      this.prisma.user.findUnique({ where: { id: userId }, select: { plan: true } }),
    ]);
    const plan = (user?.plan || 'ART') as 'ART' | 'PRO_ART';
    const period = currentPeriodUtc();
    const row = await this.prisma.usagePeriod.findUnique({
      where: { userId_period: { userId, period } },
    });

    const monthlyUnitLimit = config.plusMonthlyUnits * this.planMultiplier(plan);

    return {
      period,
      plan,
      monthlyUnitLimit,
      unitsUsed: row?.unitsUsed || 0,
      requestsUsed: row?.requestsUsed || 0,
      estimatedTokensUsed: row?.estimatedTokensUsed || 0,
    };
  }

  async assertWithinLimitOrThrow(userId: string) {
    const config = await this.appConfigService.getConfig();
    if (!config.enforceUsageLimits) return;

    const snapshot = await this.getSnapshot(userId);
    if (snapshot.unitsUsed >= snapshot.monthlyUnitLimit) {
      const err: any = new Error('Monthly quota exceeded');
      err.code = 'QUOTA_EXCEEDED';
      err.snapshot = snapshot;
      throw err;
    }
  }

  async recordUsage(params: {
    userId: string;
    userContent: string;
    assistantContent: string;
  }) {
    const period = currentPeriodUtc();
    const tokenEstimate = estimateTokens(`${params.userContent}\n${params.assistantContent}`);
    // Units are tokens estimate for now. This is what we enforce.
    const units = tokenEstimate;

    await this.prisma.usagePeriod.upsert({
      where: { userId_period: { userId: params.userId, period } },
      create: {
        userId: params.userId,
        period,
        unitsUsed: units,
        requestsUsed: 1,
        estimatedTokensUsed: tokenEstimate,
      },
      update: {
        unitsUsed: { increment: units },
        requestsUsed: { increment: 1 },
        estimatedTokensUsed: { increment: tokenEstimate },
      },
    });
  }
}

