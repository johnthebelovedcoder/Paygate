// chart.utils.ts - Utility functions for chart data conversion

import type { ChartData, RevenueData, DailyRevenueData, TrafficSourceData } from '../types/global';

/**
 * Converts various data formats to chart-compatible format
 * @param data - Array of revenue, daily revenue, traffic source, or chart data objects
 * @returns Array of chart data objects with name and value properties
 */
export const toChartData = (data: RevenueData[] | DailyRevenueData[]) => {
  // Check if data is an array and not null/undefined
  if (!data || !Array.isArray(data) || data.length === 0) {
    return [];
  }

  // Determine if data is RevenueData[] or DailyRevenueData[]
  // Assuming RevenueData has 'month' and DailyRevenueData has 'date'
  if (!data[0]) {
    // If first element is undefined, default to monthly view
    return data.map((item: any) => ({
      name: item?.month || item?.date || 'Unknown',
      value: item?.revenue || 0,
    }));
  }
  const isDailyData = (data[0] as DailyRevenueData).date !== undefined;

  return data.map((item: any) => {
    if (isDailyData) {
      const dailyItem = item as DailyRevenueData;
      return {
        name: dailyItem?.date || 'Unknown',
        value: dailyItem?.revenue || 0,
      };
    } else {
      const revenueItem = item as RevenueData;
      return {
        name: revenueItem?.month || 'Unknown',
        value: revenueItem?.revenue || 0,
      };
    }
  });
};

export function normalizeTrafficData(raw: Record<string, number>): TrafficSourceData[] {
  return Object.entries(raw).map(([key, val]) => ({
    name: key,
    value: val,
  }));
}

/**
 * Gets a specific value from chart data by name (e.g., Direct, Social, Email)
 * @param data - Array of chart data
 * @param name - Name to search for
 * @returns Value for the specified name or 0 if not found
 */
export function getValueByName(data: ChartData[], name: string): number {
  const item = data.find(d => d.name === name);
  return item?.value ?? 0;
}

/**
 * Converts raw revenue data to chart-compatible format
 * @param revenueData - Raw revenue data from API
 * @returns Chart-compatible data array
 */
export function convertRevenueToChartData(revenueData: any[]): ChartData[] {
  return revenueData.map(item => ({
    name: item.name || item.date || item.day || String(item.id || 'Unknown'),
    value: item.value || item.revenue || item.amount || item.total || 0,
  }));
}

/**
 * Converts daily revenue data to chart-compatible format
 * @param dailyData - Daily revenue data from API
 * @returns Chart-compatible data array
 */
export function convertDailyRevenueToChartData(dailyData: any[]): ChartData[] {
  return dailyData.map(item => ({
    name: item.name || item.day || item.date || String(item.id || 'Unknown'),
    value: item.value || item.amount || item.revenue || 0,
  }));
}

/**
 * Combines multiple data series into a single chart data array
 * @param dataSeries - Array of data series
 * @returns Combined chart data
 */
export function combineChartData(dataSeries: { name: string; data: ChartData[] }[]): ChartData[] {
  const combined: ChartData[] = [];

  dataSeries.forEach(series => {
    series.data.forEach(item => {
      const existingItem = combined.find(c => c.name === item.name);
      if (existingItem) {
        existingItem.value += item.value;
      } else {
        combined.push({ ...item });
      }
    });
  });

  return combined;
}
