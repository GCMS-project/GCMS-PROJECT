import React from 'react';
import { Doughnut } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend
} from 'chart.js';

ChartJS.register(ArcElement, Tooltip, Legend);

const PickupStatsChart = () => {
    const data = {
        labels: ['Completed', 'Pending', 'In Progress', 'Cancelled'],
        datasets: [
            {
                data: [300, 50, 100, 25],
                backgroundColor: [
                    '#16a34a', // green-600
                    '#f59e0b', // amber-500
                    '#0284c7', // sky-600
                    '#dc2626', // red-600
                ],
                hoverBackgroundColor: [
                    '#15803d',
                    '#d97706',
                    '#0369a1',
                    '#b91c1c',
                ],
                borderColor: '#fff',
                borderWidth: 2,
            },
        ],
    };

    const options = {
        responsive: true,
        maintainAspectRatio: false,
        cutout: '70%',
        plugins: {
            legend: {
                position: 'bottom' as const,
            },
        },
    };

    return <Doughnut data={data} options={options} />;
};

export default PickupStatsChart; 