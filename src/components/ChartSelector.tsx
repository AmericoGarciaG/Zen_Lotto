import React from 'react';

interface ChartSelectorProps {
  activeChart: 'sum' | 'oddEven' | 'groups' | 'spread';
  setActiveChart: (chart: 'sum' | 'oddEven' | 'groups' | 'spread') => void;
}

const ChartSelector: React.FC<ChartSelectorProps> = ({ activeChart, setActiveChart }) => {
  return (
    <div className="chart-selector">
      <button 
        className={activeChart === 'sum' ? 'active' : ''}
        onClick={() => setActiveChart('sum')}
      >
        Suma en el Tiempo
      </button>
      <button 
        className={activeChart === 'oddEven' ? 'active' : ''}
        onClick={() => setActiveChart('oddEven')}
      >
        Distribución Par/Impar
      </button>
      <button 
        className={activeChart === 'groups' ? 'active' : ''}
        onClick={() => setActiveChart('groups')}
      >
        Distribución por Grupos
      </button>
      <button 
        className={activeChart === 'spread' ? 'active' : ''}
        onClick={() => setActiveChart('spread')}
      >
        Distribución de Rango (Spread)
      </button>
    </div>
  );
};

export default ChartSelector;