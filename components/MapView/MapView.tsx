'use client';

import dynamic from 'next/dynamic';
import type { Earthquake } from '@/types/earthquake';
import styles from './MapView.module.css';

interface LegendEntry { color: string; label: string; }

const LEGEND: LegendEntry[] = [
  { color: '#ef4444', label: '<10km' },
  { color: '#fb923c', label: '<70km' },
  { color: '#fbbf24', label: '<300km' },
  { color: '#34d399', label: 'deep' },
];

const MapClient = dynamic(() => import('./MapClient'), {
  ssr: false,
  loading: () => (
    <div className={styles.mapSkeleton}>
      <svg className={styles.spinner} width="30" height="30" viewBox="0 0 24 24" fill="none"
        stroke="var(--cyan-500)" strokeWidth="2.2" strokeLinecap="round" aria-hidden="true">
        <path d="M21 12a9 9 0 1 1-6.2-8.5" />
      </svg>
      <span className={styles.skeletonLabel}>Loading map…</span>
    </div>
  ),
});

interface MapViewProps { earthquakes: Earthquake[]; }

export default function MapView({ earthquakes }: MapViewProps) {
  return (
    <div className={styles.mapPanel}>
      <MapClient earthquakes={earthquakes} />

      <div className={styles.overlayTop}>
        <span className={styles.overlayLabel}>Epicenters</span>
        <span className={styles.overlayCount}>{earthquakes.length.toLocaleString()}</span>
      </div>

      <div className={styles.overlayLegend} aria-label="Depth colour legend">
        {LEGEND.map(({ color, label }) => (
          <span key={label} className={styles.legendItem}>
            <span className={styles.legendDot} style={{ backgroundColor: color }} aria-hidden="true" />
            <span className={styles.legendLabel}>{label}</span>
          </span>
        ))}
      </div>
    </div>
  );
}
