import React from 'react';
import type { TrafficSource } from '../types/analytics.types';

interface TrafficSourcesChartProps {
  data: TrafficSource[];
}

const TrafficSourcesChart: React.FC<TrafficSourcesChartProps> = ({ data }) => {
  // Format currency
  const formatCurrency = (value: number): string => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  // Sort data by visits
  const sortedData = [...data].sort((a, b) => b.visits - a.visits);

  return (
    <div className="bg-white shadow rounded-lg overflow-hidden dark:bg-gray-800 dark:shadow-gray-900/50">
      <div className="px-4 py-5 sm:p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4 dark:text-white">Traffic Sources</h3>

        <div className="space-y-4">
          {sortedData.map((item, index) => (
            <div key={item.id} className="flex items-center">
              <div className="w-32 text-sm font-medium text-gray-700 dark:text-gray-300">
                {item.name}
              </div>
              <div className="flex-1 ml-4">
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-gray-600 dark:text-gray-400">{item.visits} visits</span>
                  <span className="text-gray-500 dark:text-gray-400">
                    {item.conversionRate.toFixed(1)}% CR
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2 dark:bg-gray-700">
                  <div
                    className="bg-green-500 h-2 rounded-full"
                    style={{
                      width: `${Math.min(100, (item.visits / Math.max(...sortedData.map(d => d.visits))) * 100)}%`,
                    }}
                  ></div>
                </div>
                <div className="flex justify-between text-xs mt-1">
                  <span className="text-gray-500 dark:text-gray-400">
                    {item.conversions} conversions
                  </span>
                  <span className="text-gray-500 dark:text-gray-400">
                    {formatCurrency(item.revenue)} revenue
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default TrafficSourcesChart;
