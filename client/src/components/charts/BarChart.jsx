import {
  Chart as ChartJS,
  CategoryScale, LinearScale, BarElement,
  Title, Tooltip, Legend,
} from 'chart.js';
import { Bar } from 'react-chartjs-2';
import { CHART_COLORS } from '../../utils/helpers';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const BarChart = ({ data: rawData, label }) => {
  const sorted = Object.entries(rawData || {})
    .sort(([, a], [, b]) => b - a)
    .slice(0, 8);

  const labels = sorted.map(([k]) => k);
  const values = sorted.map(([, v]) => v);

  const data = {
    labels,
    datasets: [
      {
        label: label || 'Count',
        data: values,
        backgroundColor: CHART_COLORS[0],
        borderColor: CHART_COLORS[0].replace('0.8', '1'),
        borderWidth: 1,
        borderRadius: 6,
        borderSkipped: false,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: 'rgba(13, 13, 26, 0.95)',
        borderColor: 'rgba(147, 51, 234, 0.3)',
        borderWidth: 1,
        titleColor: '#fff',
        bodyColor: '#a78bfa',
        padding: 12,
        cornerRadius: 10,
      },
    },
    scales: {
      x: {
        grid: { display: false },
        ticks: { color: '#6b7280', font: { size: 11 } },
        border: { color: 'rgba(255,255,255,0.06)' },
      },
      y: {
        grid: { color: 'rgba(255,255,255,0.04)' },
        ticks: { color: '#6b7280', font: { size: 11 }, precision: 0 },
        border: { color: 'rgba(255,255,255,0.06)' },
        beginAtZero: true,
      },
    },
  };

  if (!labels.length) {
    return (
      <div className="flex items-center justify-center h-48 text-gray-500 text-sm">
        No data yet
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-1">
      <p className="text-xs text-gray-400 font-medium uppercase tracking-wider">{label}</p>
      <div className="h-52"><Bar data={data} options={options} /></div>
    </div>
  );
};

export default BarChart;
