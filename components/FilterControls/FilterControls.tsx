'use client';

import { useState } from 'react';
import type { ChangeEvent } from 'react';
import type { DepthCategory } from '@/types/earthquake';
import { useDashboardStore } from '@/store/dashboardStore';
import styles from './FilterControls.module.css';

type Section = 'magnitude' | 'depth' | null;

interface DepthOption {
  value: DepthCategory;
  label: string;
  range: string;
  color: string;
}

const DEPTH_OPTIONS: DepthOption[] = [
  { value: 'shallow',      label: 'Shallow',      range: '< 70 km',     color: '#f97316' },
  { value: 'intermediate', label: 'Intermediate',  range: '70 – 300 km', color: '#eab308' },
  { value: 'deep',         label: 'Deep',          range: '> 300 km',    color: '#22c55e' },
];

const SCALE_BARS: { label: string; widthPct: number }[] = [
  { label: 'Minor',    widthPct: 12 },
  { label: 'Moderate', widthPct: 32 },
  { label: 'Strong',   widthPct: 58 },
  { label: 'Major',    widthPct: 88 },
];

export default function FilterControls() {
  const [openSection, setOpenSection] = useState<Section>('magnitude');

  const filters             = useDashboardStore((s) => s.filters);
  const setMagnitudeRange   = useDashboardStore((s) => s.setMagnitudeRange);
  const toggleDepthCategory = useDashboardStore((s) => s.toggleDepthCategory);
  const resetFilters        = useDashboardStore((s) => s.resetFilters);

  const toggleSection = (section: Section) =>
    setOpenSection((prev) => (prev === section ? null : section));

  const handleMagnitudeChange = (e: ChangeEvent<HTMLInputElement>) =>
    setMagnitudeRange([0, Number(e.target.value)]);

  const handleDepthChange = (e: ChangeEvent<HTMLInputElement>) =>
    toggleDepthCategory(e.target.value as DepthCategory);

  const sliderFillPct = (filters.magnitude[1] / 10) * 100;
  const sliderBg = `linear-gradient(90deg, var(--cyan-500) ${sliderFillPct}%, var(--bg-raised) ${sliderFillPct}%)`;

  return (
    <aside className={styles.controls} aria-label="Filter controls">
      <div className={styles.header}>
        <h2 className={styles.headerTitle}>Filters</h2>
        <button className={styles.resetButton} onClick={resetFilters} aria-label="Reset all filters">
          Reset
        </button>
      </div>

      <div className={styles.filterSection}>
        <button
          className={styles.sectionHeader}
          onClick={() => toggleSection('magnitude')}
          aria-expanded={openSection === 'magnitude'}
          aria-controls="section-magnitude"
        >
          <h3 className={styles.sectionTitle}>Magnitude</h3>
          <span className={`${styles.expandIcon} ${openSection === 'magnitude' ? styles.open : ''}`} aria-hidden="true">
            {openSection === 'magnitude' ? '−' : '+'}
          </span>
        </button>

        {openSection === 'magnitude' && (
          <div id="section-magnitude" className={styles.sectionContent}>
            <div className={styles.sliderWrapper}>
              <input
                type="range"
                className={styles.slider}
                min={0} max={10} step={0.5}
                value={filters.magnitude[1]}
                onChange={handleMagnitudeChange}
                aria-label="Maximum magnitude"
                style={{ background: sliderBg }}
              />
              <div className={styles.sliderLabels} aria-hidden="true">
                <span>0</span><span>5</span><span>10</span>
              </div>
            </div>
            <div className={styles.magnitudeReadout}>
              <span className={styles.readoutLabel}>Showing magnitudes</span>
              <span className={styles.readoutValue}>{filters.magnitude[0]}–{filters.magnitude[1]}</span>
            </div>
            <div className={styles.scaleList} aria-label="Magnitude scale reference">
              {SCALE_BARS.map(({ label, widthPct }) => (
                <div key={label} className={styles.scaleRow}>
                  <div className={styles.scaleBar} style={{ width: `${widthPct}%` }} aria-hidden="true" />
                  <span className={styles.scaleLabel}>{label}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      <div className={styles.filterSection}>
        <button
          className={styles.sectionHeader}
          onClick={() => toggleSection('depth')}
          aria-expanded={openSection === 'depth'}
          aria-controls="section-depth"
        >
          <h3 className={styles.sectionTitle}>Depth</h3>
          <span className={`${styles.expandIcon} ${openSection === 'depth' ? styles.open : ''}`} aria-hidden="true">
            {openSection === 'depth' ? '−' : '+'}
          </span>
        </button>

        {openSection === 'depth' && (
          <div id="section-depth" className={styles.sectionContent}>
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
                  <span className={styles.depthDot} style={{ color, backgroundColor: color }} aria-hidden="true" />
                  <span className={styles.depthMeta}>
                    <span className={styles.depthName}>{label}</span>
                    <span className={styles.depthRange}>{range}</span>
                  </span>
                </label>
              ))}
            </div>
            <p className={styles.depthNote}>
              Shallow earthquakes are often more destructive despite lower magnitudes,
              as seismic energy dissipates less before reaching the surface.
            </p>
          </div>
        )}
      </div>

      <p className={styles.panelNote}>Auto-refreshes every 60s · Filters persist</p>
    </aside>
  );
}