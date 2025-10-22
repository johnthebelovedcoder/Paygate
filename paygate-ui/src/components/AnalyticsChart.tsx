// components/AnalyticsChart.tsx - Enhanced analytics chart with ApexCharts
import React from 'react';
import Chart from 'react-apexcharts';
import type { ApexOptions } from 'apexcharts';

interface ChartData {
  name: string;
  value: number;
  // For multi-series data - allow additional numeric properties
  [key: string]: string | number;
}

interface AnalyticsChartProps {
  data: ChartData[];
  title: string;
  type?: 'line' | 'bar' | 'area' | 'pie' | 'scatter' | 'radar' | 'composed' | 'radial';
  color?: string;
  multiSeries?: boolean;
  seriesKeys?: string[];
  currency?: string; // Add currency prop
}

const AnalyticsChart: React.FC<AnalyticsChartProps> = ({
  data,
  title,
  type = 'line',
  color = 'indigo',
  multiSeries = false,
  seriesKeys = [],
  currency = 'USD', // Default to USD
}) => {
  // Color configurations
  const colorConfig: Record<string, { primary: string; secondary: string; gradient: string[] }> = {
    indigo: {
      primary: '#4f46e5',
      secondary: '#818cf8',
      gradient: ['#4f46e5', '#6366f1', '#818cf8'],
    },
    green: {
      primary: '#16a34a',
      secondary: '#4ade80',
      gradient: ['#16a34a', '#22c55e', '#4ade80'],
    },
    blue: {
      primary: '#2563eb',
      secondary: '#60a5fa',
      gradient: ['#2563eb', '#3b82f6', '#60a5fa'],
    },
    purple: {
      primary: '#9333ea',
      secondary: '#a855f7',
      gradient: ['#9333ea', '#a855f7', '#c084fc'],
    },
    yellow: {
      primary: '#ca8a04',
      secondary: '#eab308',
      gradient: ['#ca8a04', '#eab308', '#facc15'],
    },
    red: {
      primary: '#dc2626',
      secondary: '#f87171',
      gradient: ['#dc2626', '#ef4444', '#f87171'],
    },
  };

  const colors = colorConfig[color] ||
    colorConfig.indigo || { primary: '#6366f1', gradient: ['#6366f1', '#8b5cf6'] };

  // Prepare chart options
  const getChartOptions = (): ApexOptions => {
    // Handle empty data
    const chartData = data && data.length > 0 ? data : [{ name: 'No Data', value: 0 }];

    const baseOptions: ApexOptions = {
      chart: {
        type: 'line',
        toolbar: {
          show: true,
          tools: {
            download: true,
            selection: true,
            zoom: true,
            zoomin: true,
            zoomout: true,
            pan: true,
            reset: true,
          },
        },
        background: 'transparent',
      },
      title: {
        text: title,
        style: {
          fontSize: '16px',
          fontWeight: '600',
          color: '#1f2937',
        },
      },
      theme: {
        mode: 'light',
      },
      tooltip: {
        theme: 'light',
        y: {
          formatter: value => {
            // Handle undefined or null values
            if (value == null || isNaN(value)) return '0';
            // Format as currency using the provided currency
            return new Intl.NumberFormat('en-US', {
              style: 'currency',
              currency: currency,
              minimumFractionDigits: 0,
              maximumFractionDigits: 0,
            }).format(value);
          },
        },
      },
      legend: {
        position: 'top',
        horizontalAlign: 'right',
      },
      dataLabels: {
        enabled: false,
      },
      stroke: {
        curve: 'smooth',
        width: 2,
      },
      grid: {
        borderColor: '#e5e7eb',
        strokeDashArray: 3,
      },
      xaxis: {
        categories: chartData.map(item => item.name),
        labels: {
          style: {
            colors: '#6b7280',
          },
        },
        axisBorder: {
          color: '#e5e7eb',
        },
        axisTicks: {
          color: '#e5e7eb',
        },
      },
      yaxis: {
        labels: {
          style: {
            colors: '#6b7280',
          },
          formatter: value => {
            // Handle undefined or null values
            if (value == null || isNaN(value)) return '0';
            return new Intl.NumberFormat('en-US', {
              style: 'currency',
              currency: currency,
              minimumFractionDigits: 0,
              maximumFractionDigits: 0,
            }).format(value);
          },
        },
      },
    };

    // Override options based on chart type
    switch (type) {
      case 'bar':
        return {
          ...baseOptions,
          chart: {
            ...baseOptions.chart,
            type: 'bar',
          },
          plotOptions: {
            bar: {
              horizontal: false,
              columnWidth: '55%',
              borderRadius: 4,
            },
          },
          colors: multiSeries && seriesKeys.length > 0 ? colors.gradient : [colors.primary],
        };

      case 'area':
        return {
          ...baseOptions,
          chart: {
            ...baseOptions.chart,
            type: 'area',
          },
          colors: multiSeries && seriesKeys.length > 0 ? colors.gradient : [colors.primary],
          fill: {
            type: 'gradient',
            gradient: {
              shadeIntensity: 1,
              opacityFrom: 0.7,
              opacityTo: 0.3,
              stops: [0, 90, 100],
            },
          },
        };

      case 'pie':
        return {
          ...baseOptions,
          chart: {
            ...baseOptions.chart,
            type: 'pie',
          },
          labels: data.map(item => item.name),
          colors: colors.gradient,
          legend: {
            ...baseOptions.legend,
            position: 'bottom',
          },
          tooltip: {
            ...baseOptions.tooltip,
            y: {
              formatter: value => `${value.toLocaleString()}`,
            },
          },
        };

      case 'scatter':
        return {
          ...baseOptions,
          chart: {
            ...baseOptions.chart,
            type: 'scatter',
          },
          colors: [colors.primary],
          markers: {
            size: 6,
          },
        };

      case 'radar':
        return {
          ...baseOptions,
          chart: {
            ...baseOptions.chart,
            type: 'radar',
          },
          colors: [colors.primary],
          fill: {
            opacity: 0.3,
          },
          markers: {
            size: 0,
          },
          xaxis: {
            categories: data.map(item => item.name),
          },
        };

      case 'radial':
        return {
          ...baseOptions,
          chart: {
            ...baseOptions.chart,
            type: 'radialBar',
          },
          colors: colors.gradient,
          plotOptions: {
            radialBar: {
              dataLabels: {
                name: {
                  fontSize: '22px',
                },
                value: {
                  fontSize: '16px',
                },
                total: {
                  show: true,
                  label: 'Total',
                  formatter: w => {
                    const total = w.globals.seriesTotals.reduce((a: number, b: number) => a + b, 0);
                    return `${total.toLocaleString()}`;
                  },
                },
              },
            },
          },
          labels: data.map(item => item.name),
        };

      case 'line':
      default:
        return {
          ...baseOptions,
          chart: {
            ...baseOptions.chart,
            type: 'line',
          },
          colors: multiSeries && seriesKeys.length > 0 ? colors.gradient : [colors.primary],
          markers: {
            size: 4,
            colors: multiSeries && seriesKeys.length > 0 ? colors.gradient : [colors.primary],
            strokeColors: '#fff',
            strokeWidth: 2,
          },
        };
    }
  };

  // Prepare series data
  const getSeriesData = (): ApexAxisChartSeries | ApexNonAxisChartSeries => {
    // Handle empty data
    const chartData = data && data.length > 0 ? data : [{ name: 'No Data', value: 0 }];

    switch (type) {
      case 'pie':
      case 'radial':
        return chartData.map(item => {
          // Handle undefined or null values
          const value = item.value != null ? item.value : 0;
          return isNaN(value) ? 0 : value;
        });

      case 'radar':
        return [
          {
            name: title,
            data: chartData.map(item => {
              // Handle undefined or null values
              const value = item.value != null ? item.value : 0;
              return isNaN(value) ? 0 : value;
            }),
          },
        ];

      default:
        if (multiSeries && seriesKeys.length > 0) {
          return seriesKeys.map(key => ({
            name: key,
            data: chartData.map(item => {
              // Handle undefined or null values
              const value = item[key] != null ? item[key] : 0;
              const numValue = typeof value === 'number' ? value : Number(value);
              return isNaN(numValue) ? 0 : numValue;
            }),
          }));
        } else {
          return [
            {
              name: title,
              data: chartData.map(item => {
                // Handle undefined or null values
                const value = item.value != null ? item.value : 0;
                const numValue = typeof value === 'number' ? value : Number(value);
                return isNaN(numValue) ? 0 : numValue;
              }),
            },
          ];
        }
    }
  };

  const chartOptions = getChartOptions();
  const seriesData = getSeriesData();

  return (
    <div className="bg-white shadow rounded-lg p-4 sm:p-6 dark:bg-gray-800 dark:shadow-gray-900/50">
      <div className="h-64 sm:h-80">
        <Chart
          options={chartOptions}
          series={seriesData}
          type={chartOptions.chart?.type}
          height="100%"
        />
      </div>
    </div>
  );
};

export default AnalyticsChart;
