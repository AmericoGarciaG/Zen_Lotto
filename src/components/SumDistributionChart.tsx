import { Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { historicalData } from '../data/lottoHistory';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

const SumDistributionChart = () => {
  const sums = historicalData.map(draw => draw.combinacion.reduce((a, b) => a + b, 0));

  const bins = {
    '< 80': 0,
    '80-94': 0,
    '95-109': 0,
    '110-124': 0,
    '125-139': 0,
    '140-154': 0,
    '> 154': 0,
  };

  sums.forEach(sum => {
    if (sum < 80) bins['< 80']++;
    else if (sum >= 80 && sum <= 94) bins['80-94']++;
    else if (sum >= 95 && sum <= 109) bins['95-109']++;
    else if (sum >= 110 && sum <= 124) bins['110-124']++;
    else if (sum >= 125 && sum <= 139) bins['125-139']++;
    else if (sum >= 140 && sum <= 154) bins['140-154']++;
    else bins['> 154']++;
  });

  const data = {
    labels: Object.keys(bins),
    datasets: [
      {
        label: 'Número de Sorteos',
        data: Object.values(bins),
        backgroundColor: 'rgba(75, 192, 192, 0.6)',
      },
    ],
  };

  const options = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top' as const,
      },
      title: {
        display: true,
        text: 'Distribución de la Suma de Combinaciones',
      },
    },
  };

  return <Bar options={options} data={data} />;
};

export default SumDistributionChart;
