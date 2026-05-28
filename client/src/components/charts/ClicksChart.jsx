import {
  Chart as ChartJS,
  CategoryScale, LinearScale, PointElement, LineElement,
  Title, Tooltip, Legend, Filler,
} from 'chart.js';
import { Line } from 'react-chartjs-2';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, Filler);

const ClicksChart = ({ clicksOverTime }) => {
  const labels = Object.keys(clicksOverTime).sort();
  const values = labels.map((k) => clicksOverTime[k]);

  const data = {
    labels,
    datasets: [
      {
        label: 'Clicks',
        data: values,
        fill: true,
        borderColor: 'rgba(147, 51, 234, 1)',
        backgroundColor: (ctx) => {
          const gradient = ctx.chart.ctx.createLinearGradient(0, 0, 0, 300);
          gradient.addColorStop(0, 'rgba(147, 51, 234, 0.25)');
          gradient.addColorStop(1, 'rgba(147, 51, 234, 0)');
          return gradient;
        },
        tension: 0.4,
        pointBackgroundColor: 'rgba(147, 51, 234, 1)',
        pointBorderColor: '#0a0a0f',
        pointBorderWidth: 2,
        pointRadius: 4,
        pointHoverRadius: 6,
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
        grid: { color: 'rgba(255,255,255,0.04)' },
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
        No click data yet
      </div>
    );
  }

  return <div className="h-56"><Line data={data} options={options} /></div>;
};

export default ClicksChart;
