'use client';

import {
  AreaChart as ReAreaChart, Area,
  XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer,
} from 'recharts';
import type { Earthquake } from '@/types/earthquake';
import styles from './AdvancedCharts.module.css';

//  Types

interface AreaChartProps {
  earthquakes: Earthquake[];
}

interface HourPoint {
  time: string;   // ISO — XAxis key
  count: number;
}

interface TooltipProps {
  active?: boolean;
  payload?: { value: number }[];
  label?: string;
}

//  Helpers

function buildHourlyData(quakes: Earthquake[]): HourPoint[] {
  const counts: Record<string, number> = {};

  quakes.forEach((q) => {
    const d = new Date(q.properties.time);
    const key = new Date(
      d.getFullYear(), d.getMonth(), d.getDate(), d.getHours(),
    ).toISOString();
    counts[key] = (counts[key] ?? 0) + 1;
  });

  return Object.entries(counts)
    .map(([time, count]) => ({ time, count }))
    .sort((a, b) => a.time.localeCompare(b.time));
}

//  Tooltip 

function CustomTooltip({ active, payload, label }: TooltipProps) {
  if (!active || !payload?.length || !label) return null;
  return (
    <div className={styles.tooltip}>
      <p className={styles.tooltipLabel}>
        {new Date(label).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
      </p>
      <p className={styles.tooltipValue}>
        <span>Events: </span>{payload[0].value}
      </p>
    </div>
  );
}

//  Shared axis props 

const axisProps = {
  stroke: 'transparent',
  tick: { fill: 'var(--text-muted)', fontSize: 11, fontFamily: 'var(--font-mono)' },
  tickLine: false,
  axisLine: false,
} as const;

//  Component 

export default function AreaChart({ earthquakes }: AreaChartProps) {
  const data = buildHourlyData(earthquakes);

  // Derive peak hour for footer metric
  const peak = data.reduce(
    (best, d) => (d.count > best.count ? d : best),
    { time: '', count: 0 },
  );

  if (!data.length) {
    return (
      <div className={styles.chartCard}>
        <div className={styles.chartHeader}>
          <h3 className={styles.chartTitle}>Temporal Activity</h3>
          <p className={styles.chartDescription}>Earthquakes detected per hour</p>
        </div>
        <div className={styles.emptyState}>No data for selected filters</div>
      </div>
    );
  }

  return (
    <div className={styles.chartCard}>
      <div className={styles.chartHeader}>
        <h3 className={styles.chartTitle}>Temporal Activity</h3>
        <p className={styles.chartDescription}>Earthquakes detected per hour</p>
      </div>

      <div className={styles.chartBody}>
        <ResponsiveContainer width="100%" height={240}>
          <ReAreaChart data={data} margin={{ top: 8, right: 8, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%"  stopColor="var(--cyan-500)" stopOpacity={0.25} />
                <stop offset="95%" stopColor="var(--cyan-500)" stopOpacity={0.02} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" vertical={false} />
            <XAxis
              {...axisProps}
              dataKey="time"
              tickFormatter={(t: string) => `${new Date(t).getHours()}h`}
            />
            <YAxis {...axisProps} />
            <Tooltip content={<CustomTooltip />} />
            <Area
              type="monotone"
              dataKey="count"
              stroke="var(--cyan-500)"
              strokeWidth={2}
              fill="url(#areaGrad)"
              dot={false}
              activeDot={{ r: 4, fill: 'var(--cyan-400)', strokeWidth: 0 }}
            />
          </ReAreaChart>
        </ResponsiveContainer>
      </div>

      <div className={styles.chartFooter}>
        <div className={styles.metric}>
          <span className={styles.metricLabel}>Total Hours</span>
          <span className={styles.metricValue}>{data.length}</span>
        </div>
        <div className={styles.metric}>
          <span className={styles.metricLabel}>Peak Hour</span>
          <span className={styles.metricValue}>
            {peak.time ? `${new Date(peak.time).getHours()}:00` : '—'}
          </span>
        </div>
        <div className={styles.metric}>
          <span className={styles.metricLabel}>Peak Count</span>
          <span className={`${styles.metricValue} ${styles.amber}`}>{peak.count}</span>
        </div>
      </div>
    </div>
  );
}