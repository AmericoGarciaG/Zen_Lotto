import { useState, useEffect } from 'react';
import { Doughnut } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import { getHistoricalData } from '../api';

ChartJS.register(ArcElement, Tooltip, Legend);

const OddEvenChart = () => {
  const [chartData, setChartData] = useState<any>({
    labels: [],
    datasets: [],
  });

  useEffect(() => {
    getHistoricalData().then(data => {
      const counts: { [key: string]: number } = {
        '3 Pares / 3 Impares': 0,
        '4 Pares / 2 Impares': 0,
        '2 Pares / 4 Impares': 0,
        '5 Pares / 1 Impar': 0,
        '1 Par / 5 Impares': 0,
        '6 Pares / 0 Impares': 0,
        '0 Pares / 6 Impares': 0,
      };

      data.forEach(draw => {
        const evens = draw.combinacion.filter(n => n % 2 === 0).length;
        const odds = 6 - evens;
        const key = `${evens} Pares / ${odds} Impares`;
        if (counts[key] !== undefined) {
          counts[key]++;
        }
      });

      const labels = Object.keys(counts);
      const dataValues = Object.values(counts);

      setChartData({
        labels,
        datasets: [
          {
            label: 'Frecuencia',
            data: dataValues,
            backgroundColor: [
              'rgba(75, 192, 192, 0.6)',
              'rgba(54, 162, 235, 0.6)',
              'rgba(255, 206, 86, 0.6)',
              'rgba(255, 99, 132, 0.6)',
              'rgba(153, 102, 255, 0.6)',
              'rgba(255, 159, 64, 0.6)',
              'rgba(201, 203, 207, 0.6)'
            ],
            borderColor: [
              'rgba(75, 192, 192, 1)',
              'rgba(54, 162, 235, 1)',
              'rgba(255, 206, 86, 1)',
              'rgba(255, 99, 132, 1)',
              'rgba(153, 102, 255, 1)',
              'rgba(255, 159, 64, 1)',
              'rgba(201, 203, 207, 1)'
            ],
            borderWidth: 1,
          },
        ],
      });
    });
  }, []);

  return (
    <div>
      <h2>Frecuencia de Distribución Par/Impar</h2>
      <Doughnut data={chartData} />
    </div>
  );
};

export default OddEvenChart;