import React from 'react';

interface ChartSelectorProps {
  // Ahora el tipo acepta 'omegaDistribution'
  setActiveChart: (chart: 'omegaDistribution') => void;
  activeChart: 'omegaDistribution' | null;
}

const ChartSelector: React.FC<ChartSelectorProps> = ({ setActiveChart, activeChart }) => {
  return (
    <div className="chart-selector">
      <button
        // Comprobar si activeChart es 'omegaDistribution'
        className={activeChart === 'omegaDistribution' ? 'active' : ''}
        // Al hacer clic, establecer activeChart en 'omegaDistribution'
        onClick={() => setActiveChart('omegaDistribution')}
      >
        Distribución Omega
      </button>
    </div>
  );
};

export default ChartSelector;
