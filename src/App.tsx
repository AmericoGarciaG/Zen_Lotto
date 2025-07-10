import { useState } from 'react';
import CombinationAnalyzer from './components/CombinationAnalyzer';
import DistributionCharts from './components/DistributionCharts';
import DatabaseViewer from './components/DatabaseViewer';
import OmegaScoreVsPrizeChart from './components/OmegaScoreVsPrizeChart';
import OmegaScoreDistributionHistogram from './components/OmegaScoreDistributionHistogram';
import WinnerOmegaScoreDistributionHistogram from './components/WinnerOmegaScoreDistributionHistogram';
import './App.css';

type View = 'analyzer' | 'database';

function App() {
  const [activeChart, setActiveChart] = useState<'omegaDistribution' | null>(null);
  const [currentView, setCurrentView] = useState<View>('analyzer');

  return (
    <div className="App">
      <header className="App-header">
        <h1>Zen Lotto</h1>
        <p>Analizador de Combinaciones de Melate Retro</p>
        <nav>
          <button onClick={() => setCurrentView('analyzer')} className={currentView === 'analyzer' ? 'active' : ''}>
            Analizador
          </button>
          <button onClick={() => setCurrentView('database')} className={currentView === 'database' ? 'active' : ''}>
            Visor de BD
          </button>
        </nav>
      </header>
      <main>
        {currentView === 'analyzer' ? (
          <>
            <CombinationAnalyzer setActiveChart={setActiveChart} />
            <div className="charts-container">
              {activeChart === 'omegaDistribution' && <DistributionCharts />}
              {activeChart === 'omegaDistribution' && <OmegaScoreVsPrizeChart />}
              {activeChart === 'omegaDistribution' && <OmegaScoreDistributionHistogram />}
              {activeChart === 'omegaDistribution' && <WinnerOmegaScoreDistributionHistogram />}
            </div>
          </>
        ) : (
          <DatabaseViewer />
        )}
      </main>
    </div>
  );
}

export default App;
