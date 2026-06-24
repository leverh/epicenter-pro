'use client';

import type { Earthquake } from '@/types/earthquake';
import { useDashboardStore } from '@/store/dashboardStore';
import styles from './LiveFeed.module.css';

interface LiveFeedProps { earthquakes: Earthquake[]; }

const MAG_COLORS = ['#34d399', '#22d3ee', '#38bdf8', '#fbbf24', '#fb923c', '#f87171', '#ef4444'];

function magColor(m: number): string {
  return MAG_COLORS[Math.min(Math.max(Math.floor(m), 0), 6)];
}

function depthLabel(d: number): string {
  if (d < 70) return 'Shallow';
  if (d <= 300) return 'Intermediate';
  return 'Deep';
}

function timeAgo(ts: number): string {
  const s = (Date.now() - ts) / 1000;
  if (s < 60)    return `${Math.floor(s)}s`;
  if (s < 3600)  return `${Math.floor(s / 60)}m`;
  if (s < 86400) return `${Math.floor(s / 3600)}h`;
  return `${Math.floor(s / 86400)}d`;
}

export default function LiveFeed({ earthquakes }: LiveFeedProps) {
  const setSelectedQuake = useDashboardStore((s) => s.setSelectedQuake);

  const recent = [...earthquakes]
    .sort((a, b) => b.properties.time - a.properties.time)
    .slice(0, 40);

  return (
    <aside className={styles.feed} aria-label="Live earthquake feed">
      <div className={styles.header}>
        <h2 className={styles.title}>Live Feed</h2>
        <span className={styles.subtitle}>MOST RECENT</span>
      </div>

      <div className={styles.list}>
        {recent.map((q) => {
          const mag = q.properties.mag ?? 0;
          const col = magColor(mag);
          const depth = q.geometry.coordinates[2];
          return (
            <button key={q.id} className={styles.row} onClick={() => setSelectedQuake(q)}>
              <span
                className={styles.mag}
                style={{ color: col, background: `${col}1a`, borderColor: `${col}40` }}
              >
                {mag.toFixed(1)}
              </span>
              <span className={styles.meta}>
                <span className={styles.place}>{q.properties.place ?? 'Unknown location'}</span>
                <span className={styles.detail}>{depth.toFixed(0)} km · {depthLabel(depth)}</span>
              </span>
              <span className={styles.ago} suppressHydrationWarning>{timeAgo(q.properties.time)}</span>
            </button>
          );
        })}
        {!recent.length && <div className={styles.empty}>No events in range</div>}
      </div>
    </aside>
  );
}
