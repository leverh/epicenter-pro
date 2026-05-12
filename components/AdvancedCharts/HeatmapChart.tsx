'use client';

import { useMemo } from 'react';
import {
  ScatterChart, Scatter, XAxis, YAxis,
  Tooltip, ResponsiveContainer, Cell,
} from 'recharts';
import type { Earthquake } from '@/types/earthquake';
import styles from './AdvancedCharts.module.css';

//  Types

interface HeatmapChartProps {
  earthquakes: Earthquake[];
}

interface HeatCell {
  hour: number;
  mag: number;
  count: number;
}

interface TooltipProps {
  active?: boolean;
  payload?: { payload: HeatCell }[];
}

//  Helpers

const HOURS   = Array.from({ length: 24 }, (_, i) => i);
const MAG_BINS = Array.from({ length: 8 },  (_, i) => i); // 0–7

function buildHeatGrid(quakes: Earthquake[]): {
  cells: HeatCell[];
  maxCount: number;
  peakHour: number;
  peakHourCount: number;
  commonMag: number;
  commonMagCount: number;
} {
  const grid: Record<string, number> = {};
  const hourCounts: Record<number, number> = {};
  const magCounts:  Record<number, number> = {};

  quakes.forEach((q) => {
    const mag  = Math.min(Math.floor(q.properties.mag ?? 0), 7);
    const hour = new Date(q.properties.time).getUTCHours();
    const key  = `${mag}:${hour}`;

    grid[key]       = (grid[key] ?? 0) + 1;
    hourCounts[hour] = (hourCounts[hour] ?? 0) + 1;
    magCounts[mag]   = (magCounts[mag] ?? 0) + 1;
  });

  const cells: HeatCell[] = [];
  let maxCount = 1;

  MAG_BINS.forEach((mag) => {
    HOURS.forEach((hour) => {
      const count = grid[`${mag}:${hour}`] ?? 0;
      cells.push({ hour, mag, count });
      if (count > maxCount) maxCount = count;
    });
  });

  // Peak hour
  const [peakHour, peakHourCount] = Object.entries(hourCounts).reduce(
    ([bh, bc], [h, c]) => (c > bc ? [Number(h), c] : [bh, bc]),
    [0, 0],
  );

  // Most common magnitude bucket
  const [commonMag, commonMagCount] = Object.entries(magCounts).reduce(
    ([bm, bc], [m, c]) => (c > bc ? [Number(m), c] : [bm, bc]),
    [0, 0],
  );

  return { cells, maxCount, peakHour, peakHourCount, commonMag, commonMagCount };
}

/** Map count → cyan opacity */
function countToColor(count: number, max: number): string {
  if (count === 0) return 'rgba(255,255,255,0.03)';
  const t = Math.sqrt(count / max); // sqrt for perceptual balance
  const alpha = 0.12 + t * 0.78;
  return `rgba(0,180,216,${alpha.toFixed(2)})`;
}

// Custom dot (square cell)

interface SquareDotProps {
  cx?: number;
  cy?: number;
  payload?: HeatCell;
  maxCount?: number;
}

function SquareDot({ cx = 0, cy = 0, payload, maxCount = 1 }: SquareDotProps) {
  if (!payload) return null;
  const size = 14;
  return (
    <rect
      x={cx - size / 2}
      y={cy - size / 2}
      width={size}
      height={size}
      rx={2}
      fill={countToColor(payload.count, maxCount)}
      stroke="rgba(0,180,216,0.08)"
      strokeWidth={0.5}
    />
  );
}

// Tooltip

function CustomTooltip({ active, payload }: TooltipProps) {
  if (!active || !payload?.length) return null;
  const { hour, mag, count } = payload[0].payload;
  return (
    <div className={styles.tooltip}>
      <p className={styles.tooltipLabel}>
        Mag {mag === 7 ? '7+' : `${mag}–${mag + 1}`} · {hour}:00 UTC
      </p>
      <p className={styles.tooltipValue}>
        <span>Events: </span>{count}
      </p>
    </div>
  );
}

// Component

export default function HeatmapChart({ earthquakes }: HeatmapChartProps) {
  const { cells, maxCount, peakHour, peakHourCount, commonMag, commonMagCount } =
    useMemo(() => buildHeatGrid(earthquakes), [earthquakes]);

  const axisProps = {
    stroke: 'transparent',
    tick: { fill: 'var(--text-muted)', fontSize: 10, fontFamily: 'var(--font-mono)' },
    tickLine: false,
    axisLine: false,
  } as const;

  return (
    <div className={styles.chartCard}>
      <div className={styles.chartHeader}>
        <h3 className={styles.chartTitle}>Temporal Patterns</h3>
        <p className={styles.chartDescription}>
          Frequency by hour (UTC) × magnitude — darker = more events
        </p>
      </div>

      <div className={styles.chartBody}>
        <ResponsiveContainer width="100%" height={240}>
          <ScatterChart margin={{ top: 8, right: 16, left: -8, bottom: 0 }}>
            <XAxis
              {...axisProps}
              dataKey="hour"
              type="number"
              domain={[0, 23]}
              ticks={[0, 6, 12, 18, 23]}
              tickFormatter={(h: number) => `${h}h`}
              label={{
                value: 'Hour (UTC)',
                position: 'insideBottom',
                offset: -2,
                fill: 'var(--text-muted)',
                fontSize: 10,
                fontFamily: 'var(--font-mono)',
              }}
            />
            <YAxis
              {...axisProps}
              dataKey="mag"
              type="number"
              domain={[0, 7]}
              ticks={[0, 1, 2, 3, 4, 5, 6, 7]}
              tickFormatter={(m: number) => (m === 7 ? '7+' : String(m))}
              label={{
                value: 'Magnitude',
                angle: -90,
                position: 'insideLeft',
                offset: 12,
                fill: 'var(--text-muted)',
                fontSize: 10,
                fontFamily: 'var(--font-mono)',
              }}
            />
            <Tooltip content={<CustomTooltip />} cursor={false} />
            <Scatter
              data={cells}
              shape={(props: any) => <SquareDot {...props} maxCount={maxCount} />}
            >
              {cells.map((c, i) => (
                <Cell key={i} fill={countToColor(c.count, maxCount)} />
              ))}
            </Scatter>
          </ScatterChart>
        </ResponsiveContainer>
      </div>

      <div className={styles.insightRow}>
        <div className={styles.insightBlock}>
          <span className={styles.insightTitle}>Peak Hour</span>
          <span className={styles.insightValue}>{peakHour}:00 UTC</span>
          <span className={styles.insightDesc}>{peakHourCount} events</span>
        </div>
        <div className={styles.insightBlock}>
          <span className={styles.insightTitle}>Most Common Magnitude</span>
          <span className={styles.insightValue}>
            Mag {commonMag === 7 ? '7+' : `${commonMag}–${commonMag + 1}`}
          </span>
          <span className={styles.insightDesc}>{commonMagCount} events</span>
        </div>
      </div>
    </div>
  );
}