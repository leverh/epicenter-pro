'use client';

import { useMemo } from 'react';
import {
  BarChart, Bar, Cell,
  XAxis, YAxis, CartesianGrid,
  Tooltip, ReferenceLine,
  ResponsiveContainer,
} from 'recharts';
import type { Earthquake } from '@/types/earthquake';
import styles from './AdvancedCharts.module.css';

// Types

interface MagnitudeHistogramProps {
  earthquakes: Earthquake[];
}

interface Bin {
  label: string;
  count: number;
  x0: number;
  x1: number;
}

interface Stats {
  min: string;
  max: string;
  mean: string;
  median: string;
  count: number;
}

interface TooltipProps {
  active?: boolean;
  payload?: { value: number; payload: Bin }[];
}

// Constants

const BIN_COLORS: string[] = [
  '#34d399', // 0–1
  '#22c55e', // 1–2
  '#00b4d8', // 2–3
  '#0284c7', // 3–4
  '#f59e0b', // 4–5
  '#f97316', // 5–6
  '#ef4444', // 6–7
  '#dc2626', // 7+
];

//  Helpers

function buildBins(quakes: Earthquake[]): Bin[] {
  const counts = new Array<number>(8).fill(0);

  quakes.forEach((q) => {
    const mag    = q.properties.mag ?? 0;
    const bucket = Math.min(Math.floor(mag), 7);
    counts[bucket]++;
  });

  return counts.map((count, i) => ({
    label:  i === 7 ? '7+' : `${i}–${i + 1}`,
    x0:     i,
    x1:     i + 1,
    count,
  }));
}

function computeStats(quakes: Earthquake[]): Stats | null {
  const mags = quakes
    .map((q) => q.properties.mag)
    .filter((m): m is number => typeof m === 'number')
    .sort((a, b) => a - b);

  if (!mags.length) return null;

  const sum    = mags.reduce((s, m) => s + m, 0);
  const mean   = sum / mags.length;
  const mid    = Math.floor(mags.length / 2);
  const median = mags.length % 2 === 0
    ? (mags[mid - 1] + mags[mid]) / 2
    : mags[mid];

  return {
    count:  mags.length,
    min:    mags[0].toFixed(1),
    max:    mags[mags.length - 1].toFixed(1),
    mean:   mean.toFixed(1),
    median: median.toFixed(1),
  };
}

// Tooltip

function CustomTooltip({ active, payload }: TooltipProps) {
  if (!active || !payload?.length) return null;
  const { label, count } = payload[0].payload;
  return (
    <div className={styles.tooltip}>
      <p className={styles.tooltipLabel}>Magnitude {label}</p>
      <p className={styles.tooltipValue}>
        <span>Events: </span>{count}
      </p>
    </div>
  );
}

// Component

const axisProps = {
  stroke: 'transparent',
  tick: { fill: 'var(--text-muted)', fontSize: 11, fontFamily: 'var(--font-mono)' },
  tickLine: false,
  axisLine: false,
} as const;

export default function MagnitudeHistogram({ earthquakes }: MagnitudeHistogramProps) {
  const bins  = useMemo(() => buildBins(earthquakes),    [earthquakes]);
  const stats = useMemo(() => computeStats(earthquakes), [earthquakes]);

  return (
    <div className={styles.chartCard}>
      <div className={styles.chartHeader}>
        <h3 className={styles.chartTitle}>Magnitude Histogram</h3>
        <p className={styles.chartDescription}>
          Frequency distribution by magnitude range
          {stats && ` · mean ${stats.mean} shown`}
        </p>
      </div>

      <div className={styles.chartBody}>
        <ResponsiveContainer width="100%" height={240}>
          <BarChart data={bins} margin={{ top: 8, right: 8, left: -20, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} />
            <XAxis {...axisProps} dataKey="label" />
            <YAxis {...axisProps} />
            <Tooltip content={<CustomTooltip />} cursor={false} />

            {stats && (
              <ReferenceLine
                x={`${Math.floor(parseFloat(stats.mean))}–${Math.floor(parseFloat(stats.mean)) + 1}`}
                stroke="var(--amber-400)"
                strokeDasharray="4 3"
                strokeWidth={1.5}
                label={{
                  value: `μ ${stats.mean}`,
                  position: 'top',
                  fill: 'var(--amber-400)',
                  fontSize: 10,
                  fontFamily: 'var(--font-mono)',
                }}
              />
            )}

            <Bar dataKey="count" barSize={32} radius={[4, 4, 0, 0]}>
              {bins.map((_, i) => (
                <Cell key={i} fill={BIN_COLORS[i]} opacity={0.85} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      {stats && (
        <div className={styles.chartFooter}>
          <div className={styles.metric}>
            <span className={styles.metricLabel}>Min</span>
            <span className={styles.metricValue}>{stats.min}</span>
          </div>
          <div className={styles.metric}>
            <span className={styles.metricLabel}>Max</span>
            <span className={`${styles.metricValue} ${styles.amber}`}>{stats.max}</span>
          </div>
          <div className={styles.metric}>
            <span className={styles.metricLabel}>Mean</span>
            <span className={styles.metricValue}>{stats.mean}</span>
          </div>
          <div className={styles.metric}>
            <span className={styles.metricLabel}>Median</span>
            <span className={styles.metricValue}>{stats.median}</span>
          </div>
        </div>
      )}
    </div>
  );
}