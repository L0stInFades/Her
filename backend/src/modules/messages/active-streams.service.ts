import { Injectable } from '@nestjs/common';

@Injectable()
export class ActiveStreamsService {
  private readonly activeByUserId = new Map<string, number>();

  getMaxPerUser(): number {
    const raw = process.env.MAX_CONCURRENT_STREAMS_PER_USER;
    const n = raw ? Number(raw) : 2;
    return Number.isFinite(n) && n > 0 ? Math.floor(n) : 2;
  }

  getActiveCount(userId: string): number {
    return this.activeByUserId.get(userId) ?? 0;
  }

  tryAcquire(userId: string): { ok: true } | { ok: false; active: number; max: number } {
    const max = this.getMaxPerUser();
    const active = this.getActiveCount(userId);
    if (active >= max) {
      return { ok: false, active, max };
    }
    this.activeByUserId.set(userId, active + 1);
    return { ok: true };
  }

  release(userId: string) {
    const active = this.getActiveCount(userId);
    if (active <= 1) {
      this.activeByUserId.delete(userId);
      return;
    }
    this.activeByUserId.set(userId, active - 1);
  }
}

