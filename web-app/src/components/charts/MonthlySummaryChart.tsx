import React from 'react';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

const MonthlySummaryChart = () => {
  const data = {
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
    datasets: [
      {
        label: 'Pickups',
        data: [65, 59, 80, 81, 56, 55, 40, 60, 75, 90, 110, 120],
        fill: true,
        backgroundColor: 'rgba(2, 132, 199, 0.2)', // sky-600
        borderColor: 'rgba(2, 132, 199, 1)',
        tension: 0.4,
        pointBackgroundColor: 'rgba(2, 132, 199, 1)',
        pointBorderColor: '#fff',
        pointHoverRadius: 7,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
    },
    scales: {
      y: {
        beginAtZero: true,
      },
    },
  };

  return <Line data={data} options={options} />;
};

export default MonthlySummaryChart; 