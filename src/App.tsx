import { useState } from 'react';
import './App.css'
import CombinationAnalyzer from './components/CombinationAnalyzer';
import SumOverTimeChart from './components/SumOverTimeChart';
import OddEvenChart from './components/OddEvenChart';
import GroupsChart from './components/GroupsChart';
import SpreadChart from './components/SpreadChart';
import ChartSelector from './components/ChartSelector';

function App() {
  const [activeChart, setActiveChart] = useState<'sum' | 'oddEven' | 'groups' | 'spread'>('sum');

  return (
    <div className="App">
      <header>
        <h1>Zen Lotto - Análisis Estadístico de Melate Retro</h1>
      </header>
      <main>
        <section>
          <h2>Analizador de Combinaciones</h2>
          <CombinationAnalyzer setActiveChart={setActiveChart} />
        </section>
        <section>
          <ChartSelector activeChart={activeChart} setActiveChart={setActiveChart} />
          {activeChart === 'sum' && <SumOverTimeChart />}
          {activeChart === 'oddEven' && <OddEvenChart />}
          {activeChart === 'groups' && <GroupsChart />}
          {activeChart === 'spread' && <SpreadChart />}
        </section>
      </main>
    </div>
  )
}

export default App