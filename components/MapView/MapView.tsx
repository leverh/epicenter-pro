'use client';

import dynamic from 'next/dynamic';
import type { Earthquake } from '@/types/earthquake';
import styles from './MapView.module.css';

// Legend config

interface LegendEntry {
  color: string;
  label: string;
}

const LEGEND: LegendEntry[] = [
  { color: '#ef4444', label: '< 10 km' },
  { color: '#f97316', label: '10 – 70 km' },
  { color: '#eab308', label: '70 – 300 km' },
  { color: '#22c55e', label: '> 300 km' },
];

// Lazy-loaded map

const MapClient = dynamic(() => import('./MapClient'), {
  ssr: false,
  loading: () => (
    <div className={styles.mapSkeleton}>
      <div className={styles.skeletonPulse} aria-hidden="true" />
      <span className={styles.skeletonLabel}>Loading map…</span>
    </div>
  ),
});

// Props

interface MapViewProps {
  earthquakes: Earthquake[];
}

// Component

export default function MapView({ earthquakes }: MapViewProps) {
  return (
    <div className={styles.mapPanel}>

      <div className={styles.panelHeader}>
        <h2 className={styles.panelTitle}>Seismic Map</h2>
        <span className={styles.quakeCount}>
          <span className={styles.quakeCountNum}>{earthquakes.length.toLocaleString()}</span>
          {' '}events plotted
        </span>
      </div>

      <div className={styles.mapWrapper}>
        <MapClient earthquakes={earthquakes} />
      </div>

      <div className={styles.legend} aria-label="Depth colour legend">
        <span className={styles.legendTitle}>Depth</span>

        {LEGEND.map(({ color, label }, i) => (
          <span key={label} className={styles.legendItem}>
            {i > 0 && <span className={styles.legendDivider} aria-hidden="true" />}
            <span
              className={styles.legendDot}
              style={{ backgroundColor: color }}
              aria-hidden="true"
            />
            <span className={styles.legendLabel}>{label}</span>
          </span>
        ))}

        <span className={styles.legendNote} aria-label="Note">
          Circle size ∝ magnitude
        </span>

        <span className={styles.legendDivider} aria-hidden="true" />

        <span className={styles.clickHint} aria-label="Tip">
          {/* cursor / pointer icon */}
          <svg width="11" height="11" viewBox="0 0 24 24" fill="currentColor"
            xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
            <path d="M4 0l16 12-7 1-4 8z"/>
          </svg>
          Click any marker for details
        </span>
      </div>
    </div>
  );
}