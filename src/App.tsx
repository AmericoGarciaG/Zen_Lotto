import './App.css'
import CombinationAnalyzer from './components/CombinationAnalyzer';
import SumOverTimeChart from './components/SumOverTimeChart';

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
        <SumOverTimeChart />
      </main>
    </div>
  )
}

export default App
