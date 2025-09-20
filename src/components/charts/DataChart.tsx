'use client';

import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  TooltipItem,
} from 'chart.js';
import { Bar, Line, Pie, Doughnut } from 'react-chartjs-2';
import { CSVData, ChartConfig } from '@/types';
import styles from './DataChart.module.css';

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
);

interface DataChartProps {
  data: CSVData;
  config: ChartConfig;
  className?: string;
}

export default function DataChart({ data, config, className }: DataChartProps) {
  // Prepare chart data based on configuration
  const prepareChartData = () => {
    const xAxisIndex = data.headers.indexOf(config.xAxis);
    const yAxisIndex = data.headers.indexOf(config.yAxis);

    if (xAxisIndex === -1 || yAxisIndex === -1) {
      return null;
    }

    // Group data for aggregation
    const dataMap = new Map<string, number[]>();
    
    data.rows.forEach(row => {
      const xValue = String(row[xAxisIndex] || 'Unknown');
      const yValue = Number(row[yAxisIndex]) || 0;
      
      if (!dataMap.has(xValue)) {
        dataMap.set(xValue, []);
      }
      dataMap.get(xValue)!.push(yValue);
    });

    // Aggregate data (average for multiple values)
    const labels = Array.from(dataMap.keys());
    const values = labels.map(label => {
      const values = dataMap.get(label)!;
      return values.reduce((sum, val) => sum + val, 0) / values.length;
    });

    // Color palette
    const colors = [
      'rgba(54, 162, 235, 0.8)',
      'rgba(255, 99, 132, 0.8)',
      'rgba(255, 205, 86, 0.8)',
      'rgba(75, 192, 192, 0.8)',
      'rgba(153, 102, 255, 0.8)',
      'rgba(255, 159, 64, 0.8)',
    ];

    const backgroundColor = config.type === 'pie' || config.type === 'doughnut'
      ? colors.slice(0, labels.length)
      : config.color || colors[0];

    const borderColor = config.type === 'pie' || config.type === 'doughnut'
      ? colors.slice(0, labels.length).map(c => c.replace('0.8', '1'))
      : (config.color || colors[0]).replace('0.8', '1');

    return {
      labels,
      datasets: [
        {
          label: config.yAxis,
          data: values,
          backgroundColor,
          borderColor,
          borderWidth: 2,
          tension: config.type === 'line' ? 0.4 : undefined,
        },
      ],
    };
  };

  const chartData = prepareChartData();

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top' as const,
      },
      title: {
        display: true,
        text: config.title,
        font: {
          size: 16,
          weight: 'bold' as const,
        },
      },
      tooltip: {
        callbacks: {
          label: (context: TooltipItem<'bar' | 'line' | 'pie' | 'doughnut'>) => {
            const label = context.dataset.label || '';
            // Handle different chart types and their value formats
            let value: number;
            
            if (config.type === 'pie' || config.type === 'doughnut') {
              value = context.parsed as number;
            } else {
              value = (context.parsed as { y: number }).y;
            }
            
            return `${label}: ${Number(value).toFixed(2)}`;
          },
        },
      },
    },
    scales: config.type !== 'pie' && config.type !== 'doughnut' ? {
      x: {
        title: {
          display: true,
          text: config.xAxis,
        },
      },
      y: {
        title: {
          display: true,
          text: config.yAxis,
        },
        beginAtZero: true,
      },
    } : undefined,
  };

  if (!chartData) {
    return (
      <div className={`${styles.container} ${className || ''}`}>
        <div className={styles.error}>
          <p>Unable to create chart: Invalid column selection</p>
          <small>
            Please ensure both X-axis ({config.xAxis}) and Y-axis ({config.yAxis}) columns exist in your data
          </small>
        </div>
      </div>
    );
  }

  const renderChart = () => {
    switch (config.type) {
      case 'bar':
        return <Bar data={chartData} options={chartOptions} />;
      case 'line':
        return <Line data={chartData} options={chartOptions} />;
      case 'pie':
        return <Pie data={chartData} options={chartOptions} />;
      case 'doughnut':
        return <Doughnut data={chartData} options={chartOptions} />;
      default:
        return <Bar data={chartData} options={chartOptions} />;
    }
  };

  return (
    <div className={`${styles.container} ${className || ''}`}>
      <div className={styles.chartWrapper}>
        {renderChart()}
      </div>
    </div>
  );
}