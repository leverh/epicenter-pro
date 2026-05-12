import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import type { Earthquake, EarthquakeFilters, DepthCategory, FeedPeriod } from '@/types/earthquake';

// Types

export type AdvancedTab = 'all' | 'area' | 'depth' | 'heatmap' | 'histogram';

interface DashboardState {
  // Filter state
  filters: EarthquakeFilters;

  //  Feed period (drives which USGS endpoint is queried)
  feedPeriod: FeedPeriod;

  // Advanced panel
  showAdvanced: boolean;
  activeTab: AdvancedTab;

  // Selected earthquake (detail drawer)
  selectedQuake: Earthquake | null;
  setSelectedQuake: (quake: Earthquake | null) => void;
  setMagnitudeRange:    (range: [number, number]) => void;
  toggleDepthCategory:  (category: DepthCategory) => void;
  resetFilters:         () => void;
  setFeedPeriod:        (period: FeedPeriod) => void;
  toggleAdvanced:       () => void;
  setActiveTab:         (tab: AdvancedTab) => void;
}

// Defaults

const DEFAULT_FILTERS: EarthquakeFilters = {
  magnitude:       [0, 10],
  depthCategories: ['shallow', 'intermediate', 'deep'],
};

// Store
export const useDashboardStore = create<DashboardState>()(
  devtools(
    (set) => ({
      filters:      DEFAULT_FILTERS,
      feedPeriod:   'all_day',
      showAdvanced: false,
      activeTab:    'all',
      selectedQuake: null,

      setSelectedQuake: (quake) =>
        set({ selectedQuake: quake }, false, 'setSelectedQuake'),


      setMagnitudeRange: (range) =>
        set(
          (state) => ({ filters: { ...state.filters, magnitude: range } }),
          false,
          'setMagnitudeRange',  
        ),

      toggleDepthCategory: (category) =>
        set(
          (state) => {
            const current = state.filters.depthCategories;
            const next = current.includes(category)
              ? current.filter((c) => c !== category)
              : [...current, category];
            return { filters: { ...state.filters, depthCategories: next } };
          },
          false,
          'toggleDepthCategory',
        ),

      resetFilters: () =>
        set({ filters: DEFAULT_FILTERS }, false, 'resetFilters'),


      setFeedPeriod: (period) =>
        set({ feedPeriod: period }, false, 'setFeedPeriod'),


      toggleAdvanced: () =>
        set(
          (state) => ({ showAdvanced: !state.showAdvanced }),
          false,
          'toggleAdvanced',
        ),

      setActiveTab: (tab) =>
        set({ activeTab: tab }, false, 'setActiveTab'),
    }),
    { name: 'EpicenterHub' },
  ),
);