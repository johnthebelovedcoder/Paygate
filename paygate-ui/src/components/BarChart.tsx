import React from 'react';
import {
  BarChart as RechartsBarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import type { TooltipProps } from 'recharts';

interface BarChartProps {
  data: { name: string; value: number }[];
  title: string;
  color: string;
}

const BarChart: React.FC<BarChartProps> = ({ data, title, color }) => {
  // Map color name to actual color
  const colorMap: Record<string, string> = {
    'bg-indigo-600': '#4f46e5',
    'bg-green-600': '#16a34a',
    'bg-blue-600': '#2563eb',
    'bg-purple-600': '#9333ea',
    'bg-yellow-600': '#ca8a04',
  };

  const chartColor = colorMap[color] || '#4f46e5';

  // Custom tooltip for dark mode
  interface CustomTooltipProps extends TooltipProps<number, string> {
    active?: boolean;
    payload?: Array<{ value: number; name: string }>;
    label?: string;
  }

  const CustomTooltip: React.FC<CustomTooltipProps> = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-4 border border-gray-200 rounded shadow dark:bg-gray-800 dark:border-gray-700">
          <p className="font-medium text-gray-900 dark:text-white">{`${label}`}</p>
          <p className="text-sm text-gray-500 dark:text-gray-400">{`${title}: ${payload[0]?.value || 0}`}</p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="bg-white shadow rounded-lg p-4 sm:p-6 dark:bg-gray-800 dark:shadow-gray-900/50">
      <h3 className="text-lg font-medium text-gray-900 mb-4 dark:text-white">{title}</h3>
      <div className="h-64 sm:h-80">
        <ResponsiveContainer width="100%" height="100%">
          <RechartsBarChart
            data={data}
            margin={{
              top: 5,
              right: 30,
              left: 20,
              bottom: 5,
            }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
            <XAxis
              dataKey="name"
              stroke="#6b7280"
              tick={{ fill: '#6b7280' }}
              axisLine={{ stroke: '#e5e7eb' }}
            />
            <YAxis stroke="#6b7280" tick={{ fill: '#6b7280' }} axisLine={{ stroke: '#e5e7eb' }} />
            <Tooltip content={<CustomTooltip />} />
            <Legend />
            <Bar dataKey="value" fill={chartColor} name={title} />
          </RechartsBarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default BarChart;
