'use client';

import { useEffect } from 'react';
import { MapContainer, TileLayer, CircleMarker, Popup } from 'react-leaflet';
import type { Earthquake } from '@/types/earthquake';
import { useDashboardStore } from '@/store/dashboardStore';
import styles from './MapView.module.css';
import 'leaflet/dist/leaflet.css';

interface MapClientProps {
  earthquakes: Earthquake[];
}

function getRadius(magnitude: number | null): number {
  return Math.max(4, (magnitude ?? 0) * 3);
}

function getDepthColor(depth: number): string {
  if (depth < 10)  return '#ef4444';
  if (depth < 70)  return '#f97316';
  if (depth < 300) return '#eab308';
  return '#22c55e';
}

function formatDate(timestamp: number): string {
  return new Intl.DateTimeFormat('en-US', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(new Date(timestamp));
}

export default function MapClient({ earthquakes }: MapClientProps) {
  const setSelectedQuake = useDashboardStore((s) => s.setSelectedQuake);

  useEffect(() => {
    import('leaflet').then((L) => {
      delete (L.Icon.Default.prototype as any)._getIconUrl;
      L.Icon.Default.mergeOptions({
        iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
        iconUrl:       'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
        shadowUrl:     'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
      });
    });
  }, []);

  return (
    <MapContainer
      center={[20, 0]}
      zoom={2}
      scrollWheelZoom
      style={{ height: '100%', width: '100%' }}
    >
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
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
              color,
              fillColor: color,
              fillOpacity: 0.75,
              weight: 1,
            }}
            // Clicking a marker opens the drawer via the store
            eventHandlers={{
              click: () => setSelectedQuake(quake),
            }}
          >
            <Popup>
              <div className={styles.popupInner}>
                <p className={styles.popupPlace}>
                  {quake.properties.place ?? 'Unknown location'}
                </p>
                <table className={styles.popupTable}>
                  <tbody>
                    <tr>
                      <td>Magnitude</td>
                      <td className={styles.popupMag}>{mag.toFixed(1)}</td>
                    </tr>
                    <tr>
                      <td>Depth</td>
                      <td>{depth.toFixed(1)} km</td>
                    </tr>
                    <tr>
                      <td>Time</td>
                      <td suppressHydrationWarning>{formatDate(quake.properties.time)}</td>
                    </tr>
                    {quake.properties.felt != null && (
                      <tr>
                        <td>Felt by</td>
                        <td>{quake.properties.felt.toLocaleString()} people</td>
                      </tr>
                    )}
                  </tbody>
                </table>
                <button
                  onClick={() => setSelectedQuake(quake)}
                  style={{
                    fontFamily: 'var(--font-mono)',
                    fontSize: '11px',
                    color: 'var(--cyan-400)',
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    padding: 0,
                    letterSpacing: '0.04em',
                  }}
                >
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