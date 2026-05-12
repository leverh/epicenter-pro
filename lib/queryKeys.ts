import type { FeedPeriod } from '@/types/earthquake';

export const queryKeys = {
  earthquakes: {
    all: ['earthquakes'] as const,
    byPeriod: (period: FeedPeriod) => ['earthquakes', period] as const,
  },
} as const;