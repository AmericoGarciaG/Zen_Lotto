import { useState, useEffect } from 'react';
import { Bar } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';
import { getHistoricalData } from '../api';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const GroupsChart = () => {
  const [chartData, setChartData] = useState<any>({
    labels: [],
    datasets: [],
  });

  useEffect(() => {
    getHistoricalData().then(data => {
      const counts: { [key: string]: number } = {
        'En 1 Grupo': 0,
        'En 2 Grupos': 0,
        'En 3 Grupos': 0,
        'En 4 Grupos': 0,
      };

      data.forEach(draw => {
        const groups = new Set(draw.combinacion.map(n => {
          if (n >= 1 && n <= 9) return 1;
          if (n >= 10 && n <= 19) return 2;
          if (n >= 20 && n <= 29) return 3;
          return 4;
        }));
        const key = `En ${groups.size} Grupo${groups.size > 1 ? 's' : ''}`;
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
            label: 'Número de Sorteos',
            data: dataValues,
            backgroundColor: 'rgba(153, 102, 255, 0.6)',
          },
        ],
      });
    });
  }, []);

  return (
    <div>
      <h2>Frecuencia de Distribución por Grupos</h2>
      <p style={{ fontSize: '12px', color: '#a7a7a7', margin: '0 0 1rem 0' }}>
        Grupos: (1: 1-9), (2: 10-19), (3: 20-29), (4: 30-39)
      </p>
      <Bar data={chartData} />
    </div>
  );
};

export default GroupsChart;