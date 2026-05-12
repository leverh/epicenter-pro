// can delete

import { useState, useEffect } from 'react';
import type { Earthquake, FeedPeriod, UseEarthquakeDataReturn } from '@/types/earthquake';
import { fetchEarthquakeData } from '@/services/usgsApi';

export function useEarthquakeData(
  period: FeedPeriod = 'all_day',
  refreshKey: number = 0,
): UseEarthquakeDataReturn {
  const [earthquakes, setEarthquakes] = useState<Earthquake[]>([]);
  const [loading, setLoading]         = useState<boolean>(true);
  const [error, setError]             = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      setLoading(true);
      setError(null);

      try {
        const data = await fetchEarthquakeData(period);
        if (!cancelled) setEarthquakes(data.features);
      } catch (err) {
        if (!cancelled) {
          setError(
            err instanceof Error
              ? err.message
              : 'An unknown error occurred while fetching earthquake data.',
          );
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    load();
    return () => { cancelled = true; };
  }, [period, refreshKey]);

  return { earthquakes, loading, error };
}