'use client';

import { useDashboardStore } from '@/store/dashboardStore';
import type { FeedPeriod } from '@/types/earthquake';
import styles from './Header.module.css';

interface HeaderProps {
  lastUpdate: Date;
  onRefresh: () => void;
  isFetching: boolean;
}

const FEEDS: { id: FeedPeriod; label: string }[] = [
  { id: 'all_hour',  label: '1H' },
  { id: 'all_day',   label: '24H' },
  { id: 'all_week',  label: '7D' },
  { id: 'all_month', label: '30D' },
];

export default function Header({ lastUpdate, onRefresh, isFetching }: HeaderProps) {
  const feedPeriod   = useDashboardStore((s) => s.feedPeriod);
  const setFeedPeriod = useDashboardStore((s) => s.setFeedPeriod);

  const timeStr = lastUpdate.getTime()
    ? lastUpdate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })
    : '—';

  return (
    <header className={styles.bar}>
      <div className={styles.brand}>
        <svg className={styles.logo} width="30" height="30" viewBox="0 0 40 40" fill="none" aria-hidden="true">
          <circle cx="20" cy="20" r="18" stroke="currentColor" strokeWidth="1.4" opacity="0.5" />
          <circle cx="20" cy="20" r="10.5" stroke="currentColor" strokeWidth="1.4" opacity="0.8" />
          <circle cx="20" cy="20" r="2.6" fill="currentColor" />
          <line x1="20" y1="2"  x2="20" y2="7"  stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
          <line x1="20" y1="33" x2="20" y2="38" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
          <line x1="2"  y1="20" x2="7"  y2="20" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
          <line x1="33" y1="20" x2="38" y2="20" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
        </svg>
        <div className={styles.brandText}>
          <div className={styles.wordmark}>Epicenter<span>Hub</span></div>
          <div className={styles.tagline}>Global Seismic Monitor</div>
        </div>
      </div>

      <div className={styles.spacer} />

      <nav className={styles.feedSelector} aria-label="Feed period">
        {FEEDS.map(({ id, label }) => (
          <button
            key={id}
            className={`${styles.feedButton} ${feedPeriod === id ? styles.feedActive : ''}`}
            onClick={() => setFeedPeriod(id)}
            aria-current={feedPeriod === id ? 'true' : undefined}
          >
            {label}
          </button>
        ))}
      </nav>

      <div className={styles.status} role="status" aria-live="polite">
        <span className={styles.liveDot} aria-hidden="true">
          <span className={styles.liveDotCore} />
          <span className={styles.liveDotRing} />
        </span>
        <span className={styles.liveLabel}>LIVE</span>
        <span className={styles.statusDivider} />
        <span className={styles.statusTime} suppressHydrationWarning>{timeStr}</span>
      </div>

      <button className={styles.syncButton} onClick={onRefresh} aria-label="Refresh data now">
        <svg className={isFetching ? styles.syncSpin : ''} width="13" height="13" viewBox="0 0 24 24"
          fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <path d="M21 2v6h-6" /><path d="M3 12a9 9 0 0 1 15-6.7L21 8" />
          <path d="M3 22v-6h6" /><path d="M21 12a9 9 0 0 1-15 6.7L3 16" />
        </svg>
        Sync
      </button>
    </header>
  );
}
