// components/TestApexChart.tsx - Simple test component for ApexCharts
import React from 'react';
import Chart from 'react-apexcharts';
import { ApexOptions } from 'apexcharts';

const TestApexChart: React.FC = () => {
  const options: ApexOptions = {
    chart: {
      type: 'line',
      toolbar: {
        show: false,
      },
    },
    xaxis: {
      categories: ['Jan', 'Feb', 'Mar', 'Apr', 'May'],
    },
    yaxis: {
      labels: {
        formatter: value => `$${value.toLocaleString()}`,
      },
    },
    tooltip: {
      y: {
        formatter: value => `$${value.toLocaleString()}`,
      },
    },
  };

  const series = [
    {
      name: 'Revenue',
      data: [3000, 4500, 3200, 5100, 4800],
    },
  ];

  return (
    <div className="bg-white p-4 rounded-lg shadow">
      <h3 className="text-lg font-medium text-gray-900 mb-4">Test ApexChart</h3>
      <div className="h-64">
        <Chart options={options} series={series} type="line" height="100%" />
      </div>
    </div>
  );
};

export default TestApexChart;
