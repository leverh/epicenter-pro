'use client';

import { useEffect, useRef, useState } from 'react';
import type { Earthquake } from '@/types/earthquake';
import styles from './Hero.module.css';

interface HeroProps {
  earthquakes: Earthquake[];
  totalRaw: number;
  descriptor: string;
}

/** rAF count-up to a target number */
function useCountUp(target: number, duration = 850): number {
  const [val, setVal] = useState(0);
  const fromRef = useRef(0);
  useEffect(() => {
    const from = fromRef.current;
    const t0 = performance.now();
    let raf = 0;
    const tick = (now: number) => {
      const p = Math.min(1, (now - t0) / duration);
      const e = 1 - Math.pow(1 - p, 3);
      setVal(Math.round(from + (target - from) * e));
      if (p < 1) raf = requestAnimationFrame(tick);
      else fromRef.current = target;
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [target, duration]);
  return val;
}

/** Builds a smooth sparkline path from event timestamps */
function buildSpark(quakes: Earthquake[], w: number, h: number): string {
  if (!quakes.length) return '';
  const times = quakes.map((q) => q.properties.time);
  let min = Math.min(...times), max = Math.max(...times);
  if (min === max) { min -= 3.6e6; max += 3.6e6; }
  const N = 48, span = (max - min) / N;
  const bins = new Array(N).fill(0);
  quakes.forEach((q) => {
    let i = Math.floor((q.properties.time - min) / span);
    i = Math.max(0, Math.min(N - 1, i));
    bins[i]++;
  });
  const peak = Math.max(1, ...bins);
  return bins
    .map((c, i) => `${i ? 'L' : 'M'}${((i / (N - 1)) * w).toFixed(1)} ${(h - (c / peak) * h).toFixed(1)}`)
    .join(' ');
}

export default function Hero({ earthquakes, totalRaw, descriptor }: HeroProps) {
  const total = earthquakes.length;
  const display = useCountUp(total);

  const mags = earthquakes.map((q) => q.properties.mag ?? 0);
  const avg  = mags.length ? mags.reduce((s, m) => s + m, 0) / mags.length : 0;
  const max  = mags.length ? Math.max(...mags) : 0;
  const strongest = earthquakes.reduce<Earthquake | null>(
    (a, q) => ((q.properties.mag ?? 0) > ((a?.properties.mag ?? -1)) ? q : a), null);

  const depth = [0, 0, 0];
  earthquakes.forEach((q) => {
    const d = q.geometry.coordinates[2];
    if (d < 70) depth[0]++; else if (d <= 300) depth[1]++; else depth[2]++;
  });
  const dtot = depth.reduce((s, v) => s + v, 0) || 1;
  const pct = (v: number) => Math.round((v / dtot) * 100);

  const sparkPath = buildSpark(earthquakes, 1000, 56);
  const note = totalRaw !== total ? `${total} of ${totalRaw} after filters` : 'matching current filters';

  return (
    <section className={styles.hero}>
      <div className={styles.left}>
        <div className={styles.descriptor}>{descriptor}</div>
        <div className={styles.countRow}>
          <div className={styles.count}>{display.toLocaleString()}</div>
          <div className={styles.countMeta}>
            <div className={styles.countTitle}>events recorded</div>
            <div className={styles.countSub}>{note}</div>
          </div>
        </div>
        <div className={styles.spark}>
          <svg viewBox="0 0 1000 60" preserveAspectRatio="none" aria-hidden="true">
            <defs>
              <linearGradient id="heroSparkFill" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="var(--cyan-500)" stopOpacity="0.32" />
                <stop offset="100%" stopColor="var(--cyan-500)" stopOpacity="0" />
              </linearGradient>
            </defs>
            {sparkPath && (
              <>
                <path d={`${sparkPath} L1000 60 L0 60 Z`} fill="url(#heroSparkFill)" className={styles.sparkArea} />
                <path d={sparkPath} fill="none" stroke="var(--cyan-500)" strokeWidth="2"
                  strokeLinejoin="round" strokeLinecap="round" className={styles.sparkLine} />
              </>
            )}
          </svg>
        </div>
      </div>

      <div className={styles.stats}>
        <div className={styles.statTile}>
          <span className={styles.statLabel}>Avg Magnitude</span>
          <span className={styles.statValue}>{avg ? avg.toFixed(1) : '—'}</span>
        </div>
        <div className={`${styles.statTile} ${styles.danger}`}>
          <span className={styles.statLabel}>Strongest</span>
          <span className={styles.statValueDanger}>{max ? max.toFixed(1) : '—'}</span>
          <span className={styles.statPlace}>{strongest?.properties.place ?? '—'}</span>
        </div>
        <div className={`${styles.statTile} ${styles.wide}`}>
          <div className={styles.depthHead}>
            <span className={styles.statLabel}>Depth Composition</span>
            <span className={styles.depthUnit}>km below surface</span>
          </div>
          <div className={styles.depthBar}>
            <span style={{ width: `${pct(depth[0])}%`, background: 'var(--orange-500)' }} />
            <span style={{ width: `${pct(depth[1])}%`, background: 'var(--amber-500)' }} />
            <span style={{ width: `${pct(depth[2])}%`, background: 'var(--emerald-500)' }} />
          </div>
          <div className={styles.depthLegend}>
            <span><i style={{ background: 'var(--orange-500)' }} />Shallow {pct(depth[0])}%</span>
            <span><i style={{ background: 'var(--amber-500)' }} />Intermediate {pct(depth[1])}%</span>
            <span><i style={{ background: 'var(--emerald-500)' }} />Deep {pct(depth[2])}%</span>
          </div>
        </div>
      </div>
    </section>
  );
}
