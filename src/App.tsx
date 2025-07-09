import { useState } from 'react';
import CombinationAnalyzer from './components/CombinationAnalyzer';
import ChartSelector from './components/ChartSelector';
import DistributionCharts from './components/DistributionCharts'; // Importar el nuevo componente
import './App.css';

function App() {
  const [activeChart, setActiveChart] = useState<'omegaDistribution' | null>(null);

  return (
    <div className="App">
      <header className="App-header">
        <h1>Zen Lotto</h1>
        <p>Analizador de Combinaciones de Melate Retro</p>
      </header>
      <main>
        {/* Pasar 'omegaDistribution' para activar el nuevo gráfico */}
        <CombinationAnalyzer setActiveChart={setActiveChart} /> 
        <div className="charts-container">
          {/* El selector ahora trabajará con 'omegaDistribution' */}
          {activeChart && <ChartSelector setActiveChart={setActiveChart} activeChart={activeChart} />}
          {/* Mostrar el nuevo componente cuando 'activeChart' sea 'omegaDistribution' */}
          {activeChart === 'omegaDistribution' && <DistributionCharts />}
        </div>
      </main>
    </div>
  );
}

export default App;
