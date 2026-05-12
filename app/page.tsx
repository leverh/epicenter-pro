'use client';

import type { Earthquake, DepthCategory } from '@/types/earthquake';
import { useEarthquakeQuery } from '@/hooks';
import { useDashboardStore } from '@/store/dashboardStore';

import Header         from '@/components/Header/Header';
import FilterControls from '@/components/FilterControls/FilterControls';
import MapView        from '@/components/MapView/MapView';
import ChartPanel     from '@/components/ChartPanel/ChartPanel';
import QuakeDrawer    from '@/components/QuakeDrawer/QuakeDrawer';
import {
  AreaChart,
  DepthPieChart,
  HeatmapChart,
  MagnitudeHistogram,
} from '@/components/AdvancedCharts';

import styles from './page.module.css';

//  Constants 

const ADVANCED_TABS = [
  { id: 'all',       label: 'All' },
  { id: 'area',      label: 'Temporal' },
  { id: 'depth',     label: 'Depth' },
  { id: 'heatmap',   label: 'Patterns' },
  { id: 'histogram', label: 'Histogram' },
] as const;

//  Filter logic 

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

//  Page 

export default function Page() {
  // All shared UI state from Zustand
  const filters        = useDashboardStore((s) => s.filters);
  const feedPeriod     = useDashboardStore((s) => s.feedPeriod);
  const showAdvanced   = useDashboardStore((s) => s.showAdvanced);
  const activeTab      = useDashboardStore((s) => s.activeTab);
  const toggleAdvanced = useDashboardStore((s) => s.toggleAdvanced);
  const setActiveTab   = useDashboardStore((s) => s.setActiveTab);

  // React Query
  const {
    earthquakes,
    isLoading,
    isFetching,
    isError,
    error,
    refetch,
    dataUpdatedAt,
  } = useEarthquakeQuery(feedPeriod, 60_000);

  const filtered   = applyFilters(earthquakes, filters.magnitude, filters.depthCategories);
  const lastUpdate = new Date(dataUpdatedAt || 0);

  return (
    <div className={styles.page}>

      <Header totalCount={earthquakes.length} lastUpdate={lastUpdate} />

      <QuakeDrawer />

      {isFetching && (
        <div className={styles.loadingBar} role="status" aria-label="Refreshing data">
          <div className={styles.loadingFill} />
        </div>
      )}

      {isError && (
        <div className={styles.errorBanner} role="alert">
          <span className={styles.errorIcon} aria-hidden="true">⚠</span>
          <span>{error}</span>
          <button className={styles.retryButton} onClick={() => refetch()}>Retry</button>
        </div>
      )}

      {!isLoading && !isError && (
        <div className={styles.content}>

          <div className={styles.appGrid}>
            <aside className={styles.sidebar}>
              <FilterControls />
            </aside>

            <main className={styles.main}>
              <section aria-label="Earthquake map">
                <MapView earthquakes={filtered} />
              </section>
              <section aria-label="Earthquake analytics">
                <ChartPanel earthquakes={filtered} />
              </section>
            </main>
          </div>

          {/*  Advanced analytics  */}
          <section className={styles.advancedSection} aria-label="Advanced analytics">
            <div className={styles.advancedHeader}>
              <div className={styles.advancedTitleGroup}>
                <h2 className={styles.advancedTitle}>Advanced Analytics</h2>
                {showAdvanced && (
                  <nav className={styles.tabBar} aria-label="Chart tabs">
                    {ADVANCED_TABS.map(({ id, label }) => (
                      <button
                        key={id}
                        className={`${styles.tab} ${activeTab === id ? styles.tabActive : ''}`}
                        onClick={() => setActiveTab(id)}
                        aria-current={activeTab === id ? 'true' : undefined}
                      >
                        {label}
                      </button>
                    ))}
                  </nav>
                )}
              </div>
              <button
                className={styles.toggleButton}
                onClick={toggleAdvanced}
                aria-expanded={showAdvanced}
              >
                {showAdvanced ? 'Hide' : 'Show'} Charts
              </button>
            </div>

            {showAdvanced && (
              <div className={activeTab === 'all' ? styles.advancedGrid : styles.advancedSingle}>
                {(activeTab === 'all' || activeTab === 'area')      && <AreaChart earthquakes={filtered} />}
                {(activeTab === 'all' || activeTab === 'depth')     && <DepthPieChart earthquakes={filtered} />}
                {(activeTab === 'all' || activeTab === 'heatmap')   && <HeatmapChart earthquakes={filtered} />}
                {(activeTab === 'all' || activeTab === 'histogram') && <MagnitudeHistogram earthquakes={filtered} />}
              </div>
            )}
          </section>

          {/* ── Footer ── */}
          <footer className={styles.footer}>
            <p className={styles.footerData}>
              Data sourced from{' '}
              <a href="https://earthquake.usgs.gov/earthquakes/feed/v1.0/geojson.php"
                target="_blank" rel="noopener noreferrer">
                USGS Earthquake API
              </a>
              {' '}· Auto-refreshes every 60 seconds
            </p>
            <button className={styles.refreshButton} onClick={() => refetch()}>
              Refresh Now
            </button>
            <div className={styles.footerBottom}>
              <span>© {new Date().getFullYear()} All rights reserved</span>
              <span>
                Created by{' '}
                <a href="https://madebyever.com/" target="_blank" rel="noopener noreferrer">
                  Made By Ever
                </a>
              </span>
            </div>
          </footer>

        </div>
      )}
    </div>
  );
}