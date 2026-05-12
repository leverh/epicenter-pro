import type { EarthquakeFeatureCollection, FeedPeriod } from '@/types/earthquake';

const USGS_BASE_URL =
  'https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary';

/**
 * Fetches a USGS GeoJSON earthquake feed for the given period.
 *
 * Throws on network or HTTP errors so the caller (useEarthquakeData)
 * can catch and surface them — rather than silently returning null.
 */
export async function fetchEarthquakeData(
  feedType: FeedPeriod = 'all_day',
): Promise<EarthquakeFeatureCollection> {
  const url = `${USGS_BASE_URL}/${feedType}.geojson`;

  const response = await fetch(url);

  if (!response.ok) {
    throw new Error(`USGS API error ${response.status}: ${response.statusText}`);
  }

  return response.json() as Promise<EarthquakeFeatureCollection>;
}