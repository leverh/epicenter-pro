'use client';

import { useMemo } from 'react';
import {
  PieChart, Pie, Cell, Tooltip, ResponsiveContainer,
} from 'recharts';
import type { Earthquake } from '@/types/earthquake';
import styles from './AdvancedCharts.module.css';

//  Types 

interface DepthPieChartProps {
  earthquakes: Earthquake[];
}

interface DepthSlice {
  name: string;
  shortName: string;
  value: number;
  color: string;
}

interface TooltipProps {
  active?: boolean;
  payload?: { name: string; value: number; payload: DepthSlice }[];
}

//  Constants

const SLICES: Omit<DepthSlice, 'value'>[] = [
  { name: 'Shallow (<70 km)',        shortName: 'Shallow',      color: '#f97316' },
  { name: 'Intermediate (70–300 km)', shortName: 'Intermediate', color: '#eab308' },
  { name: 'Deep (>300 km)',           shortName: 'Deep',         color: '#22c55e' },
];

// Helpers 

function buildSlices(quakes: Earthquake[]): DepthSlice[] {
  const counts = [0, 0, 0];
  quakes.forEach((q) => {
    const d = q.geometry.coordinates[2];
    if (d < 70)       counts[0]++;
    else if (d <= 300) counts[1]++;
    else               counts[2]++;
  });
  return SLICES.map((s, i) => ({ ...s, value: counts[i] }));
}

// Tooltip 

function CustomTooltip({ active, payload }: TooltipProps) {
  if (!active || !payload?.length) return null;
  const { name, value } = payload[0];
  return (
    <div className={styles.tooltip}>
      <p className={styles.tooltipLabel}>{name}</p>
      <p className={styles.tooltipValue}>{value.toLocaleString()} events</p>
    </div>
  );
}

//  Component 

export default function DepthPieChart({ earthquakes }: DepthPieChartProps) {
  const slices = useMemo(() => buildSlices(earthquakes), [earthquakes]);
  const total  = slices.reduce((s, d) => s + d.value, 0);
  const dominant = slices.reduce((best, d) => (d.value > best.value ? d : best), slices[0]);

  return (
    <div className={styles.chartCard}>
      <div className={styles.chartHeader}>
        <h3 className={styles.chartTitle}>Depth Distribution</h3>
        <p className={styles.chartDescription}>Breakdown by depth category</p>
      </div>

      <div className={styles.chartBody}>
        <div style={{ position: 'relative' }}>
          <ResponsiveContainer width="100%" height={220}>
            <PieChart>
              <Pie
                data={slices}
                cx="50%"
                cy="50%"
                innerRadius={68}
                outerRadius={92}
                dataKey="value"
                paddingAngle={2}
                startAngle={90}
                endAngle={-270}
              >
                {slices.map((s, i) => (
                  <Cell key={i} fill={s.color} opacity={0.85} />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
            </PieChart>
          </ResponsiveContainer>

          <div className={styles.donutCenter}>
            <span className={styles.donutTotal}>{total.toLocaleString()}</span>
            <span className={styles.donutLabel}>Total</span>
          </div>
        </div>

        <div className={styles.depthLegend}>
          {slices.map((s) => (
            <div key={s.name} className={styles.depthLegendItem}>
              <span
                className={styles.depthLegendDot}
                style={{ backgroundColor: s.color }}
                aria-hidden="true"
              />
              <span className={styles.depthLegendName}>{s.name}</span>
              <span className={styles.depthLegendCount}>
                {total > 0 ? `${((s.value / total) * 100).toFixed(1)}%` : '—'}
              </span>
            </div>
          ))}
        </div>
      </div>

      <div className={styles.chartFooter}>
        <div className={styles.metric}>
          <span className={styles.metricLabel}>Most Common</span>
          <span className={`${styles.metricValue} ${styles.muted}`}>
            {dominant?.shortName ?? '—'}
          </span>
        </div>
        <div className={styles.metric}>
          <span className={styles.metricLabel}>Shallow %</span>
          <span className={styles.metricValue}>
            {total > 0 ? `${((slices[0].value / total) * 100).toFixed(1)}%` : '—'}
          </span>
        </div>
      </div>
    </div>
  );
}