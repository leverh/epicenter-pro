import { useQuery } from '@tanstack/react-query';
import type { UseQueryResult } from '@tanstack/react-query';
import { fetchEarthquakeData } from '@/services/usgsApi';
import { queryKeys } from '@/lib/queryKeys';
import type { Earthquake, FeedPeriod } from '@/types/earthquake';

export interface UseEarthquakeQueryReturn {
  earthquakes: Earthquake[];
  isLoading: boolean;
  isFetching: boolean;  
  isError: boolean;
  error: string | null;
  refetch: UseQueryResult['refetch'];
  dataUpdatedAt: number;
}

export function useEarthquakeQuery(
  period: FeedPeriod = 'all_day',
  refetchIntervalMs: number = 60_000,
): UseEarthquakeQueryReturn {
  const query = useQuery({
    queryKey:        queryKeys.earthquakes.byPeriod(period),
    queryFn:         () => fetchEarthquakeData(period),
    refetchInterval: refetchIntervalMs,
    placeholderData: (prev) => prev,
  });

  return {
    earthquakes:   query.data?.features ?? [],
    isLoading:     query.isLoading,
    isFetching:    query.isFetching,
    isError:       query.isError,
    error:         query.error instanceof Error ? query.error.message : null,
    refetch:       query.refetch,
    dataUpdatedAt: query.dataUpdatedAt,
  };
}