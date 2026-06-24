'use client';

import { useEffect } from 'react';
import { MapContainer, TileLayer, CircleMarker, Popup } from 'react-leaflet';
import type { Earthquake } from '@/types/earthquake';
import { useDashboardStore } from '@/store/dashboardStore';
import styles from './MapView.module.css';
import 'leaflet/dist/leaflet.css';

interface MapClientProps { earthquakes: Earthquake[]; }

function getRadius(magnitude: number | null): number {
  return Math.max(3, (magnitude ?? 0) * 2.4);
}

function getDepthColor(depth: number): string {
  if (depth < 10)  return '#ef4444';
  if (depth < 70)  return '#fb923c';
  if (depth < 300) return '#fbbf24';
  return '#34d399';
}

function formatDate(timestamp: number): string {
  return new Intl.DateTimeFormat('en-US', { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(timestamp));
}

export default function MapClient({ earthquakes }: MapClientProps) {
  const setSelectedQuake = useDashboardStore((s) => s.setSelectedQuake);

  useEffect(() => {
    import('leaflet').then((L) => {
      delete (L.Icon.Default.prototype as unknown as { _getIconUrl?: unknown })._getIconUrl;
      L.Icon.Default.mergeOptions({
        iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
        iconUrl:       'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
        shadowUrl:     'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
      });
    });
  }, []);

  return (
    <MapContainer
      center={[18, 5]}
      zoom={2}
      minZoom={2}
      maxZoom={9}
      zoomSnap={0.5}
      scrollWheelZoom
      worldCopyJump
      attributionControl={false}
      style={{ height: '100%', width: '100%' }}
    >
      <TileLayer
        url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
        subdomains="abcd"
        maxZoom={9}
      />

      {earthquakes.map((quake) => {
        const [lon, lat, depth] = quake.geometry.coordinates;
        const mag   = quake.properties.mag ?? 0;
        const color = getDepthColor(depth);

        return (
          <CircleMarker
            key={quake.id}
            center={[lat, lon]}
            radius={getRadius(mag)}
            pathOptions={{
              color, fillColor: color, fillOpacity: 0.5, weight: 1.2, opacity: 0.9,
              className: mag >= 4.5 ? 'eh-bigquake' : '',
            }}
            eventHandlers={{ click: () => setSelectedQuake(quake) }}
          >
            <Popup>
              <div className={styles.popupInner}>
                <p className={styles.popupPlace}>{quake.properties.place ?? 'Unknown location'}</p>
                <div className={styles.popupRow}>
                  <span>Magnitude <b style={{ color }}>{mag.toFixed(1)}</b></span>
                  <span>{depth.toFixed(0)} km</span>
                </div>
                <p className={styles.popupTime} suppressHydrationWarning>{formatDate(quake.properties.time)}</p>
                <button className={styles.popupButton} onClick={() => setSelectedQuake(quake)}>
                  Full details →
                </button>
              </div>
            </Popup>
          </CircleMarker>
        );
      })}
    </MapContainer>
  );
}
