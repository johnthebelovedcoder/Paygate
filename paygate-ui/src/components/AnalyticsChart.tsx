import React from 'react';
import Chart from 'react-apexcharts';

interface AnalyticsChartProps {
  data: any[];
  title: string;
  type: 'line' | 'bar' | 'pie' | 'donut' | 'area';
  color?: string;
  currency?: string;
  height?: number;
}

const AnalyticsChart: React.FC<AnalyticsChartProps> = ({
  data,
  title,
  type,
  color = 'indigo',
  currency = 'USD',
  height = 350
}) => {
  // Determine color based on the color prop
  const getColor = () => {
    switch(color) {
      case 'indigo':
        return ['#6366f1'];
      case 'green':
        return ['#10b981'];
      case 'blue':
        return ['#3b82f6'];
      case 'purple':
        return ['#8b5cf6'];
      case 'red':
        return ['#ef4444'];
      case 'yellow':
        return ['#f59e0b'];
      default:
        return ['#6366f1'];
    }
  };

  // Define chart options based on type
  const getChartOptions = () => {
    const baseOptions = {
      chart: {
        id: title.toLowerCase().replace(/\s+/g, '-'),
        toolbar: {
          show: false
        },
        animations: {
          enabled: true,
          easing: 'easeinout',
          speed: 800
        }
      },
      dataLabels: {
        enabled: false
      },
      stroke: {
        curve: 'smooth' as const,
        width: 3
      },
      grid: {
        yaxis: {
          lines: {
            offsetX: -30
          }
        },
        padding: {
          right: 30,
          left: 10
        }
      },
      theme: {
        palette: 'palette4'
      },
      tooltip: {
        enabled: true,
        y: {
          formatter: function(value: number) {
            if (currency) {
              return `${currency}${value.toFixed(2)}`;
            }
            return `${value}`;
          }
        }
      }
    };

    if (type === 'pie' || type === 'donut') {
      return {
        ...baseOptions,
        chart: {
          ...baseOptions.chart,
          type: 'donut'
        },
        labels: data.map((item: any) => item.name || `Item ${data.indexOf(item) + 1}`),
        legend: {
          position: 'bottom' as const
        }
      };
    } else if (type === 'bar') {
      return {
        ...baseOptions,
        chart: {
          ...baseOptions.chart,
          type: 'bar'
        },
        xaxis: {
          categories: data.map((item: any) => item.name || `Item ${data.indexOf(item) + 1}`)
        },
        plotOptions: {
          bar: {
            horizontal: false,
            columnWidth: '70%',
            endingShape: 'rounded'
          }
        },
        colors: getColor()
      };
    } else if (type === 'line' || type === 'area') {
      return {
        ...baseOptions,
        chart: {
          ...baseOptions.chart,
          type: type === 'area' ? 'area' : 'line'
        },
        xaxis: {
          categories: data.map((item: any) => item.name || `Item ${data.indexOf(item) + 1}`)
        },
        colors: getColor()
      };
    } else {
      return baseOptions;
    }
  };

  // Define series based on chart type
  const getSeries = () => {
    if (type === 'pie' || type === 'donut') {
      return data.map((item: any) => item.value || item);
    } else {
      return [{
        name: title,
        data: data.map((item: any) => item.value || item)
      }];
    }
  };

  // Determine chart type
  const chartType = (type === 'pie' || type === 'donut') ? 'donut' : type;

  return (
    <div className="w-full">
      <Chart
        options={getChartOptions()}
        series={getSeries()}
        type={chartType}
        height={height}
      />
    </div>
  );
};

export default AnalyticsChart;