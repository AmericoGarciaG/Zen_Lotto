// src/components/WinnerOmegaScoreDistributionHistogram.tsx
import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import jsonData from '../api/db.json';
import './DistributionCharts.css';

const WinnerOmegaScoreDistributionHistogram: React.FC = () => {
  // 1. Filtrar solo los registros ganadores de premio mayor que son de Clase Omega
  const winnerOmegaRecords = jsonData.melate_retro.filter((record, index, records) => {
    const nextContestRecord = records[index - 1];
    const isWinner = nextContestRecord ? parseFloat(nextContestRecord.bolsa_acumulada) === 5000000 : false;
    return isWinner && record.clase_omega === 1;
  });

  // 2. Agrupar los datos en intervalos (bins) para el histograma
  const binCount = 20; // Número de barras/intervalos
  const maxScore = 1.2;
  const binSize = maxScore / binCount;

  const bins = Array.from({ length: binCount }, (_, i) => {
    const min = i * binSize;
    const max = (i + 1) * binSize;
    return {
      name: `${min.toFixed(2)} - ${max.toFixed(2)}`,
      count: 0,
    };
  });

  // 3. Llenar los intervalos con los datos de los sorteos ganadores
  winnerOmegaRecords.forEach(record => {
    const binIndex = Math.floor(record.omega_score / binSize);
    if (binIndex >= 0 && binIndex < binCount) {
      bins[binIndex].count++;
    }
  });

  return (
    <div className="distribution-container">
        <h3>Distribución de Frecuencia del Omega Score (Premios Mayores)</h3>
        <div className="chart-section">
            <h4>Basado en Sorteos Ganadores de Clase Omega</h4>
            <ResponsiveContainer width="100%" height={400}>
            <BarChart
                data={bins}
                margin={{ top: 20, right: 30, left: 20, bottom: 60 }}
            >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" angle={-60} textAnchor="end" interval={0} />
                <YAxis label={{ value: 'Cantidad de Sorteos', angle: -90, position: 'insideLeft' }} allowDecimals={false} />
                <Tooltip />
                <Legend verticalAlign="top" />
                <Bar dataKey="count" name="Número de Sorteos" fill="#8884d8" />
            </BarChart>
            </ResponsiveContainer>
        </div>
    </div>
  );
};

export default WinnerOmegaScoreDistributionHistogram;
