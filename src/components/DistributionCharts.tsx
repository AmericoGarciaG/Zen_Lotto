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

const DistributionCharts: React.FC = () => {
  const [stats, setStats] = useState<Stats | null>(null);

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
  }, []);

  if (!stats) {
    return <div>Cargando estadísticas...</div>;
  }

  return (
    <div className="distribution-container">
      <h3>Distribución de Clases Omega</h3>

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
