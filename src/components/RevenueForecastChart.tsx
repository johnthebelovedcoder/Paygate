import React from 'react';

interface RevenueForecast {
  forecast: { date: string; predictedRevenue: number }[];
  trend: string;
  confidence: number;
}

interface RevenueForecastChartProps {
  data: RevenueForecast;
}

const RevenueForecastChart: React.FC<RevenueForecastChartProps> = ({ data }) => {
  // Format currency
  const formatCurrency = (value: number): string => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  // Get min and max values for scaling
  const revenues = data.forecast.map(item => item.predictedRevenue);
  const minRevenue = Math.min(...revenues);
  const maxRevenue = Math.max(...revenues);

  return (
    <div className="bg-white shadow rounded-lg overflow-hidden dark:bg-gray-800 dark:shadow-gray-900/50">
      <div className="px-4 py-5 sm:p-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white">Revenue Forecast</h3>
          <div className="flex items-center">
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100">
              Confidence: {data.confidence}%
            </span>
            <span className="ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-100">
              Trend: {data.trend}
            </span>
          </div>
        </div>

        <div className="h-64 flex items-end space-x-2">
          {data.forecast.map((item, index) => {
            const height = maxRevenue > 0 ? (item.predictedRevenue / maxRevenue) * 100 : 0;
            return (
              <div key={index} className="flex flex-col items-center flex-1">
                <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">
                  {formatCurrency(item.predictedRevenue)}
                </div>
                <div
                  className="w-full bg-indigo-500 rounded-t hover:bg-indigo-600 transition-colors"
                  style={{ height: `${Math.max(5, height)}%` }}
                ></div>
                <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  {new Date(item.date).toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric',
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default RevenueForecastChart;
