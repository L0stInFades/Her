import { clsx } from 'clsx';

interface SkeletonProps {
  className?: string;
  variant?: 'text' | 'circular' | 'rectangular' | 'rounded';
  width?: string | number;
  height?: string | number;
  animation?: 'pulse' | 'wave' | 'none';
}

export function Skeleton({
  className,
  variant = 'text',
  width,
  height,
  animation = 'pulse',
}: SkeletonProps) {
  const variantStyles = {
    text: 'rounded-sm h-4',
    circular: 'rounded-full',
    rectangular: 'rounded-sm',
    rounded: 'rounded-lg',
  };

  const animationStyles = {
    pulse: 'animate-pulse',
    wave: 'animate-shimmer',
    none: '',
  };

  return (
    <div
      className={clsx(
        'bg-warm-200 dark:bg-warm-800',
        variantStyles[variant],
        animationStyles[animation],
        className
      )}
      style={{ width, height }}
    />
  );
}

// Chat-specific skeleton components
export function ChatMessageSkeleton() {
  return (
    <div className="flex gap-4 px-4 py-6">
      {/* Avatar */}
      <Skeleton variant="circular" width={32} height={32} />

      {/* Content */}
      <div className="flex-1 space-y-2">
        <Skeleton width="20%" height={20} />
        <Skeleton width="100%" height={12} />
        <Skeleton width="90%" height={12} />
        <Skeleton width="95%" height={12} />
      </div>
    </div>
  );
}

export function ConversationListSkeleton({ count = 5 }: { count?: number }) {
  return (
    <div className="space-y-1 p-3">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="flex items-center gap-3 rounded-xl px-3 py-2.5">
          <Skeleton variant="circular" width={16} height={16} />
          <Skeleton width="80%" height={16} />
        </div>
      ))}
    </div>
  );
}

export function CodeBlockSkeleton() {
  return (
    <div className="my-4 space-y-2">
      <div className="flex items-center justify-between rounded-t-xl bg-warm-900 px-4 py-2 dark:bg-warm-950">
        <Skeleton width={60} height={16} className="bg-warm-800 dark:bg-warm-900" />
        <Skeleton width={50} height={24} className="bg-warm-800 dark:bg-warm-900" />
      </div>
      <div className="space-y-1 rounded-b-xl bg-warm-900 p-4 dark:bg-warm-950">
        <Skeleton width="100%" height={12} className="bg-warm-800 dark:bg-warm-900" />
        <Skeleton width="90%" height={12} className="bg-warm-800 dark:bg-warm-900" />
        <Skeleton width="85%" height={12} className="bg-warm-800 dark:bg-warm-900" />
        <Skeleton width="95%" height={12} className="bg-warm-800 dark:bg-warm-900" />
      </div>
    </div>
  );
}
