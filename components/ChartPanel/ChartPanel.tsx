'use client';

import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
  BarChart, Bar, Cell, PieChart, Pie, ResponsiveContainer,
} from 'recharts';
import type { Earthquake } from '@/types/earthquake';
import { HeatmapChart } from '@/components/AdvancedCharts';
import styles from './ChartPanel.module.css';

interface ChartPanelProps {
  earthquakes: Earthquake[];
  descriptor: string;
}

const MAG_COLORS = ['#34d399', '#22d3ee', '#38bdf8', '#fbbf24', '#fb923c', '#f87171', '#ef4444'];
const DEPTH_COLORS = ['#fb923c', '#fbbf24', '#34d399'];

const MAG_DESC: Record<number, string> = {
  0: 'Micro — rarely felt',
  1: 'Minor — felt slightly',
  2: 'Light — little damage',
  3: 'Moderate — some damage',
  4: 'Strong — moderate damage',
  5: 'Major — serious damage',
  6: 'Great — severe damage',
};

//  Data builders 

function buildSeries(quakes: Earthquake[]) {
  if (!quakes.length) return [] as { t: number; count: number }[];
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
  return bins.map((count, i) => ({ t: min + i * span, count }));
}

function buildMagBuckets(quakes: Earthquake[]) {
  const c = new Array(7).fill(0);
  quakes.forEach((q) => { c[Math.min(Math.floor(q.properties.mag ?? 0), 6)]++; });
  return c.map((count, i) => ({ range: i === 6 ? '6+' : `${i}–${i + 1}`, count, fill: MAG_COLORS[i] }));
}

function buildDepthSlices(quakes: Earthquake[]) {
  const v = [0, 0, 0];
  quakes.forEach((q) => {
    const d = q.geometry.coordinates[2];
    if (d < 70) v[0]++; else if (d <= 300) v[1]++; else v[2]++;
  });
  return [
    { name: 'Shallow', value: v[0], fill: DEPTH_COLORS[0] },
    { name: 'Intermediate', value: v[1], fill: DEPTH_COLORS[1] },
    { name: 'Deep', value: v[2], fill: DEPTH_COLORS[2] },
  ];
}

//  Tooltips 

interface TipProps { active?: boolean; payload?: { value: number }[]; label?: string | number; }

function TimeTip({ active, payload, label }: TipProps) {
  if (!active || !payload?.length) return null;
  return (
    <div className={styles.tooltip}>
      <p className={styles.tipLabel}>
        {new Date(Number(label)).toLocaleTimeString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
      </p>
      <p className={styles.tipValue}><span>Events: </span>{payload[0].value}</p>
    </div>
  );
}

function MagTip({ active, payload, label }: TipProps) {
  if (!active || !payload?.length || label == null) return null;
  const bucket = parseInt(String(label).split('–')[0], 10);
  return (
    <div className={styles.tooltip}>
      <p className={styles.tipLabel}>Magnitude {label}</p>
      <p className={styles.tipValue}><span>Events: </span>{payload[0].value}</p>
      <p className={styles.tipSub}>{MAG_DESC[bucket] ?? ''}</p>
    </div>
  );
}

const axisProps = {
  stroke: 'transparent',
  tick: { fill: '#5b6779', fontSize: 11, fontFamily: 'JetBrains Mono' },
  tickLine: false,
  axisLine: false,
} as const;

// ── Component ──

export default function ChartPanel({ earthquakes, descriptor }: ChartPanelProps) {
  const series  = buildSeries(earthquakes);
  const buckets = buildMagBuckets(earthquakes);
  const slices  = buildDepthSlices(earthquakes);
  const depthTotal = slices.reduce((s, x) => s + x.value, 0);

  return (
    <section className={styles.panel} aria-label="Analytics">
      <div className={styles.sectionHead}>
        <h2 className={styles.sectionTitle}>Analytics</h2>
        <div className={styles.rule} />
        <span className={styles.sectionMeta}>{descriptor}</span>
      </div>

      {/* Time series */}
      <div className={styles.card}>
        <div className={styles.cardHead}>
          <h3 className={styles.cardTitle}>Seismic Activity Over Time</h3>
          <span className={styles.cardMeta}>events per interval</span>
        </div>
        <ResponsiveContainer width="100%" height={280}>
          <AreaChart data={series} margin={{ top: 8, right: 12, left: -16, bottom: 0 }}>
            <defs>
              <linearGradient id="areaFill" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#22d3ee" stopOpacity={0.42} />
                <stop offset="100%" stopColor="#22d3ee" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.06)" />
            <XAxis {...axisProps} dataKey="t" type="number" domain={['dataMin', 'dataMax']} scale="time"
              tickFormatter={(t: number) => new Date(t).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} />
            <YAxis {...axisProps} allowDecimals={false} />
            <Tooltip content={<TimeTip />} cursor={{ stroke: 'rgba(255,255,255,0.12)' }} />
            <Area type="monotone" dataKey="count" stroke="#22d3ee" strokeWidth={2.4}
              fill="url(#areaFill)" activeDot={{ r: 4, fill: '#38e0f5', strokeWidth: 0 }} />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      <div className={styles.row}>
        {/* Magnitude distribution */}
        <div className={styles.card}>
          <div className={styles.cardHead}>
            <h3 className={styles.cardTitle}>Magnitude Distribution</h3>
            <span className={styles.cardMeta}>frequency by band</span>
          </div>
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={buckets} margin={{ top: 20, right: 12, left: -16, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.06)" />
              <XAxis {...axisProps} dataKey="range" />
              <YAxis {...axisProps} allowDecimals={false} />
              <Tooltip content={<MagTip />} cursor={false} />
              <Bar dataKey="count" barSize={34} radius={[4, 4, 0, 0]} isAnimationActive>
                {buckets.map((b, i) => <Cell key={i} fill={b.fill} fillOpacity={0.88} />)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Depth donut */}
        <div className={styles.card}>
          <div className={styles.cardHead}>
            <h3 className={styles.cardTitle}>Depth Breakdown</h3>
          </div>
          <div className={styles.donutWrap}>
            <div className={styles.donutChart}>
              <ResponsiveContainer width="100%" height={200}>
                <PieChart>
                  <Pie data={slices} dataKey="value" nameKey="name" cx="50%" cy="50%"
                    innerRadius={62} outerRadius={92} paddingAngle={2} stroke="none">
                    {slices.map((s, i) => <Cell key={i} fill={s.fill} fillOpacity={0.9} />)}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
              <div className={styles.donutCenter}>
                <span className={styles.donutTotal}>{depthTotal}</span>
                <span className={styles.donutLabel}>EVENTS</span>
              </div>
            </div>
            <div className={styles.donutLegend}>
              {slices.map((s) => (
                <div key={s.name} className={styles.legendRow}>
                  <span className={styles.legendSwatch} style={{ background: s.fill }} />
                  <span className={styles.legendName}>{s.name}</span>
                  <span className={styles.legendVal}>{s.value}</span>
                  <span className={styles.legendPct}>{depthTotal ? Math.round((s.value / depthTotal) * 100) : 0}%</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Heatmap */}
      <HeatmapChart earthquakes={earthquakes} />
    </section>
  );
}
