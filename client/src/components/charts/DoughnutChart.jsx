import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import { Doughnut } from 'react-chartjs-2';
import { CHART_COLORS, CHART_COLORS_BORDER } from '../../utils/helpers';

ChartJS.register(ArcElement, Tooltip, Legend);

const DoughnutChart = ({ data: rawData, label }) => {
  const labels = Object.keys(rawData || {});
  const values = Object.values(rawData || {});

  const data = {
    labels,
    datasets: [
      {
        data: values,
        backgroundColor: CHART_COLORS.slice(0, labels.length),
        borderColor: CHART_COLORS_BORDER.slice(0, labels.length),
        borderWidth: 1.5,
        hoverOffset: 6,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    cutout: '65%',
    plugins: {
      legend: {
        position: 'bottom',
        labels: {
          color: '#9ca3af',
          font: { size: 11 },
          padding: 16,
          usePointStyle: true,
          pointStyleWidth: 8,
        },
      },
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
      <div className="h-52"><Doughnut data={data} options={options} /></div>
    </div>
  );
};

export default DoughnutChart;
