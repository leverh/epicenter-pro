'use client';

import type { ChangeEvent } from 'react';
import type { DepthCategory } from '@/types/earthquake';
import { useDashboardStore } from '@/store/dashboardStore';
import styles from './FilterControls.module.css';

interface DepthOption {
  value: DepthCategory;
  label: string;
  range: string;
  color: string;
}

const DEPTH_OPTIONS: DepthOption[] = [
  { value: 'shallow',      label: 'Shallow',      range: '< 70 km',     color: '#fb923c' },
  { value: 'intermediate', label: 'Intermediate', range: '70 – 300 km', color: '#fbbf24' },
  { value: 'deep',         label: 'Deep',         range: '> 300 km',    color: '#34d399' },
];

export default function FilterControls() {
  const filters             = useDashboardStore((s) => s.filters);
  const setMagnitudeRange   = useDashboardStore((s) => s.setMagnitudeRange);
  const toggleDepthCategory = useDashboardStore((s) => s.toggleDepthCategory);
  const resetFilters        = useDashboardStore((s) => s.resetFilters);

  const handleMagnitudeChange = (e: ChangeEvent<HTMLInputElement>) =>
    setMagnitudeRange([0, Number(e.target.value)]);

  const handleDepthChange = (e: ChangeEvent<HTMLInputElement>) =>
    toggleDepthCategory(e.target.value as DepthCategory);

  const fillPct = (filters.magnitude[1] / 10) * 100;
  const sliderBg = `linear-gradient(90deg, var(--cyan-500) ${fillPct}%, rgba(255,255,255,0.1) ${fillPct}%)`;

  return (
    <aside className={styles.controls} aria-label="Filter controls">
      <div className={styles.header}>
        <h2 className={styles.headerTitle}>Filters</h2>
        <button className={styles.resetButton} onClick={resetFilters} aria-label="Reset all filters">
          Reset
        </button>
      </div>

      <div className={styles.label}>Max Magnitude</div>
      <input
        type="range"
        className={styles.slider}
        min={0} max={10} step={0.5}
        value={filters.magnitude[1]}
        onChange={handleMagnitudeChange}
        aria-label="Maximum magnitude"
        style={{ background: sliderBg }}
      />
      <div className={styles.sliderTicks} aria-hidden="true">
        <span>0</span><span>5</span><span>10</span>
      </div>
      <div className={styles.readout}>
        <span className={styles.readoutLabel}>Showing up to</span>
        <span className={styles.readoutValue}>M{filters.magnitude[1]}</span>
      </div>

      <div className={styles.divider} />

      <div className={styles.label}>Depth Range</div>
      <div className={styles.checkboxList} role="group" aria-label="Depth categories">
        {DEPTH_OPTIONS.map(({ value, label, range, color }) => (
          <label key={value} className={styles.checkboxRow}>
            <input
              type="checkbox"
              value={value}
              checked={filters.depthCategories.includes(value)}
              onChange={handleDepthChange}
              aria-label={`${label} (${range})`}
            />
            <span className={styles.depthDot} style={{ backgroundColor: color, boxShadow: `0 0 8px ${color}80` }} aria-hidden="true" />
            <span className={styles.depthMeta}>
              <span className={styles.depthName}>{label}</span>
              <span className={styles.depthRange}>{range}</span>
            </span>
          </label>
        ))}
      </div>

      <p className={styles.note}>
        Shallow quakes are often the most destructive — energy dissipates less before reaching the surface.
      </p>

      <div className={styles.spacer} />
      <div className={styles.footerNote}>AUTO-REFRESH · 60S</div>
    </aside>
  );
}
