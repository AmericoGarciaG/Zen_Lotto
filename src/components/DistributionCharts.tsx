// src/components/DistributionCharts.tsx
import React, { useState, useEffect } from 'react';
import jsonData from '../api/db.json';
import './DistributionCharts.css';

interface Stats {
  totalRecords: number;
  omegaCount: number;
  nonOmegaCount: number;
  omegaPercentage: number;
  nonOmegaPercentage: number;
}

interface WinnerStats {
  totalRecords: number;
  omegaCount: number;
  nonOmegaCount: number;
  omegaPercentage: number;
  nonOmegaPercentage: number;
}

const DistributionCharts: React.FC = () => {
  const [stats, setStats] = useState<Stats | null>(null);
  const [winnerStats, setWinnerStats] = useState<WinnerStats | null>(null);

  // Datos para el gráfico de todas las combinaciones
  const totalCombinations = 3262623;
  const omegaCombinations = 78722;
  const nonOmegaCombinations = totalCombinations - omegaCombinations;
  const omegaCombinationsPercentage = (omegaCombinations / totalCombinations) * 100;
  const nonOmegaCombinationsPercentage = 100 - omegaCombinationsPercentage;

  useEffect(() => {
    const records = jsonData.melate_retro;
    const totalRecords = records.length;
    const omegaCount = records.filter(r => r.clase_omega === 1).length;
    const nonOmegaCount = totalRecords - omegaCount;
    const omegaPercentage = totalRecords > 0 ? (omegaCount / totalRecords) * 100 : 0;
    const nonOmegaPercentage = totalRecords > 0 ? (nonOmegaCount / totalRecords) * 100 : 0;

    setStats({
      totalRecords,
      omegaCount,
      nonOmegaCount,
      omegaPercentage,
      nonOmegaPercentage,
    });

    // Filtar sorteos ganadores
    const winnerRecords = records.filter((record, index) => {
      const nextContestRecord = records[index - 1];
      return nextContestRecord ? parseFloat(nextContestRecord.bolsa_acumulada) === 5000000 : false;
    });

    const totalWinnerRecords = winnerRecords.length;
    const omegaWinnerCount = winnerRecords.filter(r => r.clase_omega === 1).length;
    const nonOmegaWinnerCount = totalWinnerRecords - omegaWinnerCount;
    const omegaWinnerPercentage = totalWinnerRecords > 0 ? (omegaWinnerCount / totalWinnerRecords) * 100 : 0;
    const nonOmegaWinnerPercentage = totalWinnerRecords > 0 ? (nonOmegaWinnerCount / totalWinnerRecords) * 100 : 0;

    setWinnerStats({
      totalRecords: totalWinnerRecords,
      omegaCount: omegaWinnerCount,
      nonOmegaCount: nonOmegaWinnerCount,
      omegaPercentage: omegaWinnerPercentage,
      nonOmegaPercentage: nonOmegaWinnerPercentage,
    });

  }, []);

  if (!stats || !winnerStats) {
    return <div>Cargando estadísticas...</div>;
  }

  return (
    <div className="distribution-container">
      <h3>Distribución de Clases Omega</h3>

      <div className="chart-section">
        <h4>Basado en Sorteos Ganadores ({winnerStats.totalRecords.toLocaleString()})</h4>
        <div className="progress-bar">
          <div
            className="progress-omega"
            style={{ width: `${winnerStats.omegaPercentage}%` }}
            title={`Clase Omega: ${winnerStats.omegaPercentage.toFixed(2)}%`}
          >
            {winnerStats.omegaPercentage.toFixed(2)}%
          </div>
          <div
            className="progress-no-omega"
            style={{ width: `${winnerStats.nonOmegaPercentage}%` }}
            title={`No Omega: ${winnerStats.nonOmegaPercentage.toFixed(2)}%`}
          >
            {winnerStats.nonOmegaPercentage.toFixed(2)}%
          </div>
        </div>
        <div className="legend">
          <span><span className="dot omega-dot"></span> Clase Omega ({winnerStats.omegaCount.toLocaleString()})</span>
          <span><span className="dot no-omega-dot"></span> No Omega ({winnerStats.nonOmegaCount.toLocaleString()})</span>
        </div>
      </div>

      <div className="chart-section">
        <h4>Basado en Sorteos Históricos ({stats.totalRecords.toLocaleString()})</h4>
        <div className="progress-bar">
          <div
            className="progress-omega"
            style={{ width: `${stats.omegaPercentage}%` }}
            title={`Clase Omega: ${stats.omegaPercentage.toFixed(2)}%`}
          >
            {stats.omegaPercentage.toFixed(2)}%
          </div>
          <div
            className="progress-no-omega"
            style={{ width: `${stats.nonOmegaPercentage}%` }}
            title={`No Omega: ${stats.nonOmegaPercentage.toFixed(2)}%`}
          >
            {stats.nonOmegaPercentage.toFixed(2)}%
          </div>
        </div>
        <div className="legend">
          <span><span className="dot omega-dot"></span> Clase Omega ({stats.omegaCount.toLocaleString()})</span>
          <span><span className="dot no-omega-dot"></span> No Omega ({stats.nonOmegaCount.toLocaleString()})</span>
        </div>
      </div>

      <div className="chart-section">
        <h4>Basado en Todas las Combinaciones Posibles ({totalCombinations.toLocaleString()})</h4>
        <div className="progress-bar">
          <div
            className="progress-omega"
            style={{ width: `${omegaCombinationsPercentage}%` }}
            title={`Clase Omega: ${omegaCombinationsPercentage.toFixed(2)}%`}
          >
            {omegaCombinationsPercentage.toFixed(2)}%
          </div>
          <div
            className="progress-no-omega"
            style={{ width: `${nonOmegaCombinationsPercentage}%` }}
            title={`No Omega: ${nonOmegaCombinationsPercentage.toFixed(2)}%`}
          >
            {nonOmegaCombinationsPercentage.toFixed(2)}%
          </div>
        </div>
        <div className="legend">
          <span><span className="dot omega-dot"></span> Clase Omega ({omegaCombinations.toLocaleString()})</span>
          <span><span className="dot no-omega-dot"></span> No Omega ({nonOmegaCombinations.toLocaleString()})</span>
        </div>
      </div>
    </div>
  );
};

export default DistributionCharts;
