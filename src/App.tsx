import { useState } from 'react';
import CombinationAnalyzer from './components/CombinationAnalyzer';
import DistributionCharts from './components/DistributionCharts';
import DatabaseViewer from './components/DatabaseViewer';
import OmegaScoreVsPrizeChart from './components/OmegaScoreVsPrizeChart';
import OmegaScoreDistributionHistogram from './components/OmegaScoreDistributionHistogram';
import WinnerOmegaScoreDistributionHistogram from './components/WinnerOmegaScoreDistributionHistogram';
import Settings from './components/Settings';
import './App.css';

type View = 'analyzer' | 'charts' | 'database' | 'settings';

function App() {
  const [currentView, setCurrentView] = useState<View>('analyzer');

  return (
    <div className="App">
      <header className="App-header">
        <h1>Zen Lotto</h1>
        <p>Plataforma de Análisis para Lotería Melate Retro</p>
        <nav>
          <button onClick={() => setCurrentView('analyzer')} className={currentView === 'analyzer' ? 'active' : ''}>
            Generador Omega
          </button>
          <button onClick={() => setCurrentView('charts')} className={currentView === 'charts' ? 'active' : ''}>
            Gráficos
          </button>
          <button onClick={() => setCurrentView('database')} className={currentView === 'database' ? 'active' : ''}>
            Visor de Históricos
          </button>
          <button onClick={() => setCurrentView('settings')} className={currentView === 'settings' ? 'active' : ''}>
            Configuración
          </button>
        </nav>
      </header>
      <main>
        {currentView === 'analyzer' && (
          <CombinationAnalyzer />
        )}
        {currentView === 'charts' && (
          <div className="charts-container">
            <DistributionCharts />
            <OmegaScoreVsPrizeChart />
            <OmegaScoreDistributionHistogram />
            <WinnerOmegaScoreDistributionHistogram />
          </div>
        )}
        {currentView === 'database' && (
          <DatabaseViewer />
        )}
        {currentView === 'settings' && (
          <Settings />
        )}
      </main>
    </div>
  );
}

export default App;
