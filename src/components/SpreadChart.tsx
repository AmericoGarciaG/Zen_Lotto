import { useState, useEffect } from 'react';
import { Bar } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';
import ChartDataLabels from 'chartjs-plugin-datalabels';
import { getHistoricalData } from '../api';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ChartDataLabels);

const SpreadChart = () => {
  const [chartData, setChartData] = useState<any>({
    labels: [],
    datasets: [],
  });
  const [chartOptions, setChartOptions] = useState({});

  useEffect(() => {
    getHistoricalData().then(data => {
      const counts: { [key: string]: number } = {
        '< 20': 0,
        '20-24': 0,
        '25-29': 0,
        '30-35': 0,
        '> 35': 0,
      };

      data.forEach(draw => {
        const spread = Math.max(...draw.combinacion) - Math.min(...draw.combinacion);
        if (spread < 20) counts['< 20']++;
        else if (spread >= 20 && spread <= 24) counts['20-24']++;
        else if (spread >= 25 && spread <= 29) counts['25-29']++;
        else if (spread >= 30 && spread <= 35) counts['30-35']++;
        else counts['> 35']++;
      });

      const labels = Object.keys(counts);
      const dataValues = Object.values(counts);
      const total = dataValues.reduce((acc, value) => acc + value, 0);

      setChartData({
        labels,
        datasets: [
          {
            label: 'Número de Sorteos',
            data: dataValues,
            backgroundColor: 'rgba(255, 159, 64, 0.6)',
          },
        ],
      });

      setChartOptions({
        plugins: {
          datalabels: {
            formatter: (value: any) => {
              const percentage = ((value / total) * 100).toFixed(2) + '%';
              return percentage;
            },
            color: '#fff',
          },
          tooltip: {
            callbacks: {
              label: function(context: any) {
                let label = context.dataset.label || '';
                if (label) {
                  label += ': ';
                }
                if (context.parsed.y !== null) {
                  const value = context.parsed.y;
                  const percentage = ((value / total) * 100).toFixed(2) + '%';
                  label += `${value} (${percentage})`;
                }
                return label;
              }
            }
          }
        },
      });
    });
  }, []);

  return (
    <div>
      <h2>Frecuencia de Rango (Spread) en Sorteos</h2>
      <Bar data={chartData} options={chartOptions} />
    </div>
  );
};

export default SpreadChart;
