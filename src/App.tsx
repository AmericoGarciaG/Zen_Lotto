import './App.css'
import CombinationAnalyzer from './components/CombinationAnalyzer';
import SumDistributionChart from './components/SumDistributionChart';

function App() {
  return (
    <div className="App">
      <header>
        <h1>Zen Lotto - Análisis Estadístico de Melate Retro</h1>
      </header>
      <main>
        <section>
          <h2>Analizador de Combinaciones</h2>
          <CombinationAnalyzer />
        </section>
        <section>
          <h2>Análisis Histórico</h2>
          <SumDistributionChart />
        </section>
      </main>
    </div>
  )
}

export default App
