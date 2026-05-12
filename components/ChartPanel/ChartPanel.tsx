'use client';

import { useState } from 'react';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
  BarChart, Bar, Cell,
  PieChart, Pie, Sector,
  ResponsiveContainer,
} from 'recharts';
import type { Earthquake } from '@/types/earthquake';
import styles from './ChartPanel.module.css';

// Types

interface ChartPanelProps {
  earthquakes: Earthquake[];
}

interface HourlyDataPoint {
  time: string;      
  count: number;
}

interface MagBucket {
  range: string;
  count: number;
  fill: string;
}

interface DepthSlice {
  name: string;
  value: number;
  fill: string;
}

interface TooltipProps {
  active?: boolean;
  payload?: { value: number }[];
  label?: string;
}

interface ActiveShapeProps {
  cx: number;
  cy: number;
  innerRadius: number;
  outerRadius: number;
  startAngle: number;
  endAngle: number;
  fill: string;
  payload: DepthSlice;
  percent: number;
  value: number;
}

// Constants

const MAG_COLORS: string[] = [
  '#34d399', // 0–1  emerald
  '#22c55e', // 1–2  green
  '#00b4d8', // 2–3  cyan
  '#0284c7', // 3–4  blue
  '#f59e0b', // 4–5  amber
  '#f97316', // 5–6  orange
  '#ef4444', // 6+   red
];

const DEPTH_COLORS: string[] = ['#f97316', '#eab308', '#22c55e'];

const MAG_DESCRIPTIONS: Record<number, string> = {
  0: 'Micro — rarely felt',
  1: 'Minor — felt slightly by some',
  2: 'Light — felt by many, little damage',
  3: 'Moderate — some damage possible',
  4: 'Strong — moderate damage',
  5: 'Major — serious damage',
  6: 'Great — severe damage possible',
};

// Data formatters

function buildHourlyData(quakes: Earthquake[]): HourlyDataPoint[] {
  const counts: Record<string, number> = {};

  quakes.forEach((q) => {
    const d = new Date(q.properties.time);
    // Truncate to the hour
    const key = new Date(
      d.getFullYear(), d.getMonth(), d.getDate(), d.getHours(),
    ).toISOString();
    counts[key] = (counts[key] ?? 0) + 1;
  });

  return Object.entries(counts)
    .map(([time, count]) => ({ time, count }))
    .sort((a, b) => a.time.localeCompare(b.time));
}

function buildMagBuckets(quakes: Earthquake[]): MagBucket[] {
  const counts = new Array<number>(7).fill(0);

  quakes.forEach((q) => {
    const bucket = Math.min(Math.floor(q.properties.mag ?? 0), 6);
    counts[bucket]++;
  });

  return counts.map((count, i) => ({
    range: i === 6 ? '6+' : `${i}–${i + 1}`,
    count,
    fill: MAG_COLORS[i],
  }));
}

function buildDepthSlices(quakes: Earthquake[]): DepthSlice[] {
  const labels = ['Shallow (0–70km)', 'Intermediate (70–300km)', 'Deep (>300km)'];
  const values = [0, 0, 0];

  quakes.forEach((q) => {
    const depth = q.geometry.coordinates[2];
    if (depth < 70)       values[0]++;
    else if (depth <= 300) values[1]++;
    else                   values[2]++;
  });

  return labels.map((name, i) => ({ name, value: values[i], fill: DEPTH_COLORS[i] }));
}

function buildStats(quakes: Earthquake[]) {
  if (!quakes.length) return { total: 0, avg: '—', max: '—' };
  const mags = quakes.map((q) => q.properties.mag ?? 0);
  const avg = mags.reduce((s, m) => s + m, 0) / mags.length;
  const max = Math.max(...mags);
  return {
    total: quakes.length,
    avg: avg.toFixed(1),
    max: max.toFixed(1),
  };
}

// Sub-components

function TimeTooltip({ active, payload, label }: TooltipProps) {
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

function MagnitudeTooltip({ active, payload, label }: TooltipProps) {
  if (!active || !payload?.length || !label) return null;
  const bucket = parseInt(label.split('–')[0], 10);
  return (
    <div className={styles.tooltip}>
      <p className={styles.tooltipLabel}>Magnitude {label}</p>
      <p className={styles.tooltipValue}>
        <span>Events: </span>{payload[0].value}
      </p>
      <p className={styles.tooltipSub}>{MAG_DESCRIPTIONS[bucket] ?? ''}</p>
    </div>
  );
}

function ActivePieShape(props: ActiveShapeProps) {
  const { cx, cy, innerRadius, outerRadius, startAngle, endAngle, fill, payload, percent, value } = props;
  return (
    <g>
      <text
        x={cx} y={cy - 14}
        textAnchor="middle"
        fill="var(--text-secondary)"
        fontSize={11}
        fontFamily="var(--font-mono)"
        letterSpacing="0.04em"
      >
        {payload.name}
      </text>
      <text
        x={cx} y={cy + 10}
        textAnchor="middle"
        fill="var(--cyan-400)"
        fontSize={13}
        fontFamily="var(--font-mono)"
        fontWeight={600}
      >
        {value.toLocaleString()}
      </text>
      <text
        x={cx} y={cy + 26}
        textAnchor="middle"
        fill="var(--text-muted)"
        fontSize={10}
        fontFamily="var(--font-mono)"
      >
        {(percent * 100).toFixed(1)}%
      </text>
      <Sector
        cx={cx} cy={cy}
        innerRadius={innerRadius}
        outerRadius={outerRadius + 6}
        startAngle={startAngle}
        endAngle={endAngle}
        fill={fill}
      />
      <Sector
        cx={cx} cy={cy}
        startAngle={startAngle}
        endAngle={endAngle}
        innerRadius={innerRadius - 4}
        outerRadius={innerRadius - 1}
        fill={fill}
      />
    </g>
  );
}

const axisProps = {
  stroke: 'transparent',
  tick: { fill: 'var(--text-muted)', fontSize: 11, fontFamily: 'var(--font-mono)' },
  tickLine: false,
  axisLine: false,
} as const;

// Main component

export default function ChartPanel({ earthquakes }: ChartPanelProps) {
  const [activePieIndex, setActivePieIndex] = useState(0);

  const hourlyData = buildHourlyData(earthquakes);
  const magBuckets = buildMagBuckets(earthquakes);
  const depthSlices = buildDepthSlices(earthquakes);
  const { total, avg, max } = buildStats(earthquakes);

  return (
    <div className={styles.panel}>

      <div className={styles.statsRow}>
        <div className={styles.statCard}>
          <span className={styles.statLabel}>Total Events</span>
          <span className={`${styles.statValue} ${styles.cyan}`}>
            {total.toLocaleString()}
          </span>
        </div>

        <div className={styles.statCard}>
          <span className={styles.statLabel}>Avg. Magnitude</span>
          <span className={styles.statValue}>{avg}</span>
        </div>

        <div className={styles.statCard}>
          <span className={styles.statLabel}>Strongest</span>
          <span className={`${styles.statValue} ${styles.amber}`}>{max}</span>
        </div>

        <div className={styles.statCard}>
          <span className={styles.statLabel}>Feed window</span>
          <span className={styles.statValue}>
            <span className={styles.liveBadge}>
              <span className={styles.liveDot} aria-hidden="true">
                <span className={styles.liveDotCore} />
                <span className={styles.liveDotRing} />
              </span>
              Live
            </span>
          </span>
        </div>
      </div>

      <div className={styles.chartGrid}>

        {/* Line chart — events over time */}
        <div className={styles.chartCard}>
          <h3 className={styles.chartTitle}>Events Over Time</h3>
          <p className={styles.chartDescription}>Earthquakes detected per hour</p>
          <ResponsiveContainer width="100%" height={260}>
            <LineChart data={hourlyData} margin={{ top: 8, right: 16, left: -16, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis
                {...axisProps}
                dataKey="time"
                tickFormatter={(t: string) => `${new Date(t).getHours()}h`}
              />
              <YAxis {...axisProps} />
              <Tooltip content={<TimeTooltip />} />
              <Line
                type="monotone"
                dataKey="count"
                stroke="var(--cyan-500)"
                strokeWidth={2}
                dot={{ r: 2.5, fill: 'var(--cyan-500)', strokeWidth: 0 }}
                activeDot={{ r: 5, fill: 'var(--cyan-400)', strokeWidth: 0 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className={styles.chartCard}>
          <h3 className={styles.chartTitle}>Magnitude Distribution</h3>
          <p className={styles.chartDescription}>Frequency by magnitude range</p>
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={magBuckets} margin={{ top: 8, right: 16, left: -16, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis {...axisProps} dataKey="range" />
              <YAxis {...axisProps} />
              <Tooltip content={<MagnitudeTooltip />} cursor={false} />
              <Bar dataKey="count" barSize={32} radius={[4, 4, 0, 0]}>
                {magBuckets.map((entry, i) => (
                  // waiting for Recharts to fix the API - will work until then
                  <Cell key={i} fill={entry.fill} opacity={0.85} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className={`${styles.chartCard} ${styles.fullWidth}`}>
          <h3 className={styles.chartTitle}>Depth Distribution</h3>
          <p className={styles.chartDescription}>Breakdown by depth category - Hover the pie for details</p>
          <ResponsiveContainer width="100%" height={280}>
            <PieChart>
              <Pie
  {...({
    data: depthSlices,
    cx: "50%",
    cy: "50%",
    innerRadius: 72,
    outerRadius: 100,
    dataKey: "value",
    activeIndex: activePieIndex,
    activeShape: (p: any) => <ActivePieShape {...p} />,
    onMouseEnter: (_: any, index: number) => setActivePieIndex(index),
    fill: (entry: DepthSlice) => entry.fill,
  } as any)}
/>
            </PieChart>
          </ResponsiveContainer>
        </div>

      </div>
    </div>
  );
}