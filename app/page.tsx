'use client';

import type { Earthquake, DepthCategory } from '@/types/earthquake';
import { useEarthquakeQuery } from '@/hooks';
import { useDashboardStore } from '@/store/dashboardStore';

import Header        from '@/components/Header/Header';
import Hero          from '@/components/Hero/Hero';
import FilterControls from '@/components/FilterControls/FilterControls';
import MapView       from '@/components/MapView/MapView';
import LiveFeed      from '@/components/LiveFeed/LiveFeed';
import ChartPanel    from '@/components/ChartPanel/ChartPanel';
import QuakeDrawer   from '@/components/QuakeDrawer/QuakeDrawer';

import styles from './page.module.css';

// Filter logic

function applyFilters(
  quakes: Earthquake[],
  magnitude: [number, number],
  depthCategories: DepthCategory[],
): Earthquake[] {
  const [minMag, maxMag] = magnitude;
  return quakes.filter((q) => {
    const mag   = q.properties.mag ?? 0;
    const depth = q.geometry.coordinates[2];
    const cat: DepthCategory =
      depth < 70 ? 'shallow' : depth <= 300 ? 'intermediate' : 'deep';
    return mag >= minMag && mag <= maxMag && depthCategories.includes(cat);
  });
}

const FEED_DESC: Record<string, string> = {
  all_hour:  'Past Hour',
  all_day:   'Past 24 Hours',
  all_week:  'Past 7 Days',
  all_month: 'Past 30 Days',
};

//  Page 

export default function Page() {
  const filters    = useDashboardStore((s) => s.filters);
  const feedPeriod = useDashboardStore((s) => s.feedPeriod);

  const {
    earthquakes, isLoading, isFetching, isError, error, refetch, dataUpdatedAt,
  } = useEarthquakeQuery(feedPeriod, 60_000);

  const filtered   = applyFilters(earthquakes, filters.magnitude, filters.depthCategories);
  const lastUpdate = new Date(dataUpdatedAt || 0);
  const descriptor = FEED_DESC[feedPeriod] ?? 'Recent';

  return (
    <div className={styles.page}>

      <Header lastUpdate={lastUpdate} onRefresh={() => refetch()} isFetching={isFetching} />

      <QuakeDrawer />

      {isError && (
        <div className={styles.errorBanner} role="alert">
          <span className={styles.errorIcon} aria-hidden="true">⚠</span>
          <span>Feed unavailable — {error}</span>
          <button className={styles.retryButton} onClick={() => refetch()}>Retry</button>
        </div>
      )}

      {isLoading && !isError && (
        <div className={styles.bootLoader} role="status" aria-label="Loading data">
          <svg className={styles.spinner} width="34" height="34" viewBox="0 0 24 24" fill="none"
            stroke="var(--cyan-500)" strokeWidth="2.2" strokeLinecap="round" aria-hidden="true">
            <path d="M21 12a9 9 0 1 1-6.2-8.5" />
          </svg>
          <span className={styles.bootLabel}>Acquiring seismic feed…</span>
        </div>
      )}

      {!isLoading && !isError && (
        <div className={styles.content}>

          <Hero earthquakes={filtered} totalRaw={earthquakes.length} descriptor={descriptor} />

          <div className={styles.commandGrid}>
            <FilterControls />
            <MapView earthquakes={filtered} />
            <LiveFeed earthquakes={filtered} />
          </div>

          <ChartPanel earthquakes={filtered} descriptor={descriptor} />

          <footer className={styles.footer}>
            <span className={styles.footerData}>
              Data ·{' '}
              <a href="https://earthquake.usgs.gov/earthquakes/feed/v1.0/geojson.php"
                target="_blank" rel="noopener noreferrer">USGS Earthquake API</a>
              {' '}· auto-refresh 60s
            </span>
            <span className={styles.footerCredit}>
              © {new Date().getFullYear()} EpicenterHub ·{' '}
              <a href="https://madebyever.com/" target="_blank" rel="noopener noreferrer">Made By Ever</a>
            </span>
          </footer>

        </div>
      )}
    </div>
  );
}
