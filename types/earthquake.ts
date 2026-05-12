// USGS Earthquake GeoJSON types
// Based on: https://earthquake.usgs.gov/earthquakes/feed/v1.0/geojson.php

export interface EarthquakeProperties {
  mag: number | null;
  place: string | null;
  time: number;           // Unix timestamp (ms)
  updated: number;        // Unix timestamp (ms)
  tz: number | null;      // timezone offset in minutes
  url: string;
  detail: string;
  felt: number | null;
  cdi: number | null;     // Community Decimal Intensity
  mmi: number | null;     // Modified Mercalli Intensity
  alert: 'green' | 'yellow' | 'orange' | 'red' | null;
  status: 'automatic' | 'reviewed' | 'deleted';
  tsunami: 0 | 1;
  sig: number;            // significance score 0–1000
  net: string;            // network contributor ID
  code: string;
  ids: string;
  sources: string;
  types: string;
  nst: number | null;     // number of seismic stations
  dmin: number | null;    // distance to nearest station (degrees)
  rms: number;            // root-mean-square travel time residual
  gap: number | null;     // azimuthal gap (degrees)
  magType: string | null; // e.g. 'ml', 'mw', 'md'
  type: string;           // e.g. 'earthquake', 'quarry blast'
  title: string;
}

export interface EarthquakeGeometry {
  type: 'Point';
  /**
   * [longitude, latitude, depth_km]
   * depth > 0 = below surface, depth < 0 = above (rare)
   */
  coordinates: [number, number, number];
}

export interface Earthquake {
  type: 'Feature';
  properties: EarthquakeProperties;
  geometry: EarthquakeGeometry;
  id: string;
}

export interface EarthquakeFeatureCollection {
  type: 'FeatureCollection';
  metadata: {
    generated: number;
    url: string;
    title: string;
    status: number;
    api: string;
    count: number;
  };
  features: Earthquake[];
  bbox?: [number, number, number, number, number, number];
}

// App-level derived types
export type FeedPeriod =
  | 'all_hour'
  | 'all_day'
  | 'all_week'
  | 'all_month'
  | 'significant_hour'
  | 'significant_day'
  | 'significant_week'
  | 'significant_month';

export type DepthCategory = 'shallow' | 'intermediate' | 'deep';

export interface EarthquakeFilters {
  magnitude: [number, number];
  depthCategories: DepthCategory[];
}

export interface EarthquakeStats {
  total: number;
  avgMag: number;
  maxMag: number;
  minMag: number;
  shallowCount: number;
  intermediateCount: number;
  deepCount: number;
}

// Hook return types

export interface UseEarthquakeDataReturn {
  earthquakes: Earthquake[];
  loading: boolean;
  error: string | null;
}