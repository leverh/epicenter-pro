'use client';

import { useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { useDashboardStore } from '@/store/dashboardStore';
import type { Earthquake } from '@/types/earthquake';
import styles from './QuakeDrawer.module.css';

// Helpers

function formatDate(timestamp: number): string {
  return new Intl.DateTimeFormat('en-US', {
    dateStyle: 'long',
    timeStyle: 'medium',
  }).format(new Date(timestamp));
}

function formatCoords(lon: number, lat: number): string {
  const ns = lat >= 0 ? 'N' : 'S';
  const ew = lon >= 0 ? 'E' : 'W';
  return `${Math.abs(lat).toFixed(3)}° ${ns}, ${Math.abs(lon).toFixed(3)}° ${ew}`;
}

/** Maps magnitude to a colour token for the badge */
function getMagStyle(mag: number): { color: string; borderColor: string; background: string } {
  if (mag >= 7)  return { color: 'var(--red-400)',     borderColor: 'var(--red-400)',     background: 'var(--red-glow)' };
  if (mag >= 5)  return { color: '#fb923c',            borderColor: '#fb923c',            background: 'var(--amber-glow)' };
  if (mag >= 3)  return { color: 'var(--amber-400)',   borderColor: 'var(--amber-400)',   background: 'var(--amber-glow)' };
  return          { color: 'var(--cyan-400)',    borderColor: 'var(--cyan-500)',    background: 'var(--cyan-glow-lg)' };
}

function getMagLabel(mag: number): string {
  if (mag >= 8)  return 'Great';
  if (mag >= 7)  return 'Major';
  if (mag >= 6)  return 'Strong';
  if (mag >= 5)  return 'Moderate';
  if (mag >= 4)  return 'Light';
  if (mag >= 3)  return 'Minor';
  if (mag >= 2)  return 'Weak';
  return 'Micro';
}

function getDepthLabel(depth: number): string {
  if (depth < 70)  return 'Shallow';
  if (depth <= 300) return 'Intermediate';
  return 'Deep';
}

// Inner panel (rendered inside the portal)

interface DrawerContentProps {
  quake: Earthquake;
  onClose: () => void;
}

function DrawerContent({ quake, onClose }: DrawerContentProps) {
  const closeRef = useRef<HTMLButtonElement>(null);

  const { properties: p, geometry: g } = quake;
  const [lon, lat, depth] = g.coordinates;
  const mag = p.mag ?? 0;
  const magStyle = getMagStyle(mag);

  useEffect(() => {
    closeRef.current?.focus();
  }, []);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [onClose]);

  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = ''; };
  }, []);

  return (
    <>
      <div
        className={styles.backdrop}
        onClick={onClose}
        aria-hidden="true"
      />

      <div
        className={styles.drawer}
        role="dialog"
        aria-modal="true"
        aria-label={`Earthquake details: ${p.place ?? 'Unknown location'}`}
      >
        <div className={styles.drawerHeader}>
          <span className={styles.drawerLabel}>Event Detail</span>
          <button
            ref={closeRef}
            className={styles.closeButton}
            onClick={onClose}
            aria-label="Close detail panel"
          >
            ×
          </button>
        </div>

        <div className={styles.drawerBody}>

          <h2 className={styles.quakePlace}>
            {p.place ?? 'Unknown location'}
          </h2>

          <div className={styles.magBadge} style={magStyle}>
            <span className={styles.magNumber}>{mag.toFixed(1)}</span>
            <span className={styles.magUnit}>{p.magType ?? 'M'} · {getMagLabel(mag)}</span>
          </div>

          <div className={styles.divider} />

          <div className={styles.dataGrid}>

            <div className={styles.dataCell}>
              <span className={styles.cellLabel}>Depth</span>
              <span className={styles.cellValue}>
                {depth.toFixed(1)} km
              </span>
              <span className={styles.cellLabel}>{getDepthLabel(depth)}</span>
            </div>

            <div className={styles.dataCell}>
              <span className={styles.cellLabel}>Significance</span>
              <span className={`${styles.cellValue} ${styles.cyan}`}>
                {p.sig}
              </span>
              <span className={styles.cellLabel}>score / 1000</span>
            </div>

            <div className={`${styles.dataCell} ${styles.wide}`}>
              <span className={styles.cellLabel}>Time</span>
              <span className={styles.cellValue} suppressHydrationWarning>
                {formatDate(p.time)}
              </span>
            </div>

            <div className={`${styles.dataCell} ${styles.wide}`}>
              <span className={styles.cellLabel}>Coordinates</span>
              <span className={styles.cellValue}>
                {formatCoords(lon, lat)}
              </span>
            </div>

            {p.felt != null && (
              <div className={styles.dataCell}>
                <span className={styles.cellLabel}>Felt reports</span>
                <span className={`${styles.cellValue} ${styles.amber}`}>
                  {p.felt.toLocaleString()}
                </span>
              </div>
            )}

            {p.cdi != null && (
              <div className={styles.dataCell}>
                <span className={styles.cellLabel}>Max CDI</span>
                <span className={styles.cellValue}>{p.cdi.toFixed(1)}</span>
                <span className={styles.cellLabel}>community intensity</span>
              </div>
            )}

            {p.mmi != null && (
              <div className={styles.dataCell}>
                <span className={styles.cellLabel}>Max MMI</span>
                <span className={styles.cellValue}>{p.mmi.toFixed(1)}</span>
                <span className={styles.cellLabel}>Mercalli intensity</span>
              </div>
            )}

            {p.nst != null && (
              <div className={styles.dataCell}>
                <span className={styles.cellLabel}>Stations</span>
                <span className={styles.cellValue}>{p.nst}</span>
                <span className={styles.cellLabel}>used in solution</span>
              </div>
            )}

            {p.gap != null && (
              <div className={styles.dataCell}>
                <span className={styles.cellLabel}>Azimuthal gap</span>
                <span className={styles.cellValue}>{p.gap.toFixed(0)}°</span>
              </div>
            )}

            {p.rms != null && (
              <div className={styles.dataCell}>
                <span className={styles.cellLabel}>RMS residual</span>
                <span className={styles.cellValue}>{p.rms.toFixed(2)} s</span>
              </div>
            )}

            <div className={styles.dataCell}>
              <span className={styles.cellLabel}>Status</span>
              <span className={`${styles.cellValue} ${p.status === 'reviewed' ? styles.green : ''}`}>
                {p.status}
              </span>
            </div>

            <div className={styles.dataCell}>
              <span className={styles.cellLabel}>Tsunami</span>
              <span className={`${styles.cellValue} ${p.tsunami ? styles.red : styles.green}`}>
                {p.tsunami ? 'Warning issued' : 'None'}
              </span>
            </div>

            {p.alert && (
              <div className={`${styles.dataCell} ${styles.wide}`}>
                <span className={styles.cellLabel}>PAGER Alert</span>
                <span className={`${styles.alertBadge} ${styles[p.alert]}`}>
                  {p.alert}
                </span>
              </div>
            )}

          </div>

          <div className={styles.divider} />

          {p.url && (
            <a
              href={p.url}
              target="_blank"
              rel="noopener noreferrer"
              className={styles.usgsLink}
            >
              View full report on USGS →
            </a>
          )}

        </div>
      </div>
    </>
  );
}

// Public component

export default function QuakeDrawer() {
  const selectedQuake   = useDashboardStore((s) => s.selectedQuake);
  const setSelectedQuake = useDashboardStore((s) => s.setSelectedQuake);

  if (!selectedQuake) return null;

  return createPortal(
    <DrawerContent quake={selectedQuake} onClose={() => setSelectedQuake(null)} />,
    document.body,
  );
}