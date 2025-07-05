import { useState, useEffect } from 'react';
import { getHistoricalData } from '../api';

interface AnalysisResult {
  criterion: string;
  status: 'good' | 'neutral' | 'bad';
  message: string;
}

const CombinationAnalyzer = () => {
  const [combination, setCombination] = useState<(number | '')[]>(Array(6).fill(''));
  const [analysisResults, setAnalysisResults] = useState<AnalysisResult[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [hasUserInteracted, setHasUserInteracted] = useState(false);

  useEffect(() => {
    if (hasUserInteracted) {
      validate(combination, 'onTheFly');
    }
  }, [combination, hasUserInteracted]);

  const validate = (combo: (number | '')[], context: 'onTheFly' | 'onAnalyze') => {
    const filledNumbers = combo.filter(n => n !== '').map(Number);
    if (filledNumbers.some(num => num < 1 || num > 39)) {
      setError('❌ Los números deben estar entre 1 y 39.');
      return false;
    }
    if (new Set(filledNumbers).size !== filledNumbers.length) {
      setError('❌ No se permiten números repetidos.');
      return false;
    }
    if (context === 'onAnalyze' && combo.some(num => num === '')) {
      setError('❌ Por favor, ingresa los 6 números.');
      return false;
    }
    setError(null);
    return true;
  };

  const handleAnalyze = () => {
    if (!validate(combination, 'onAnalyze')) {
      return;
    }

    const numbers = combination.map(num => Number(num));
    const results: AnalysisResult[] = [];

    // A. Sum Analysis
    const sum = numbers.reduce((a, b) => a + b, 0);
    if (sum >= 95 && sum <= 145) {
      results.push({ criterion: 'Suma', status: 'good', message: `✅ Suma: ${sum}. Dentro del rango más probable.` });
    } else {
      results.push({ criterion: 'Suma', status: 'bad', message: `❌ Suma: ${sum}. Fuera del rango estadísticamente común.` });
    }

    // B. Even/Odd Analysis
    const evens = numbers.filter(n => n % 2 === 0).length;
    const odds = 6 - evens;
    if ([2, 3, 4].includes(evens)) {
      results.push({ criterion: 'Par/Impar', status: 'good', message: `✅ Equilibrio: ${evens} Pares, ${odds} Impares. Es una distribución común.` });
    } else {
      results.push({ criterion: 'Par/Impar', status: 'neutral', message: `🟡 Equilibrio: ${evens} Pares, ${odds} Impares. Esta distribución es menos frecuente.` });
    }

    // C. Decade Distribution Analysis
    const decades = new Set(numbers.map(n => {
      if (n >= 1 && n <= 9) return 1;
      if (n >= 10 && n <= 19) return 2;
      if (n >= 20 && n <= 29) return 3;
      return 4;
    }));
    const numberOfDecades = decades.size;
    if (numberOfDecades === 3 || numberOfDecades === 4) {
      results.push({ criterion: 'Distribución', status: 'good', message: `✅ Distribución: Repartida en ${numberOfDecades} décadas. Estructura balanceada.` });
    } else if (numberOfDecades === 2) {
      results.push({ criterion: 'Distribución', status: 'bad', message: `❌ Distribución: Agrupada en solo ${numberOfDecades} décadas. Estructura muy atípica.` });
    } else {
      results.push({ criterion: 'Distribución', status: 'bad', message: `❌ Distribución: ¡Extremo! Todos los números en 1 década. Estructura extremadamente rara.` });
    }

    // D. Spread Analysis
    const spread = Math.max(...numbers) - Math.min(...numbers);
    if (spread >= 25 && spread <= 35) {
      results.push({ criterion: 'Rango', status: 'good', message: `✅ Rango (Spread): ${spread}. Muy bien distribuido.` });
    } else {
      results.push({ criterion: 'Rango', status: 'neutral', message: `🟡 Rango (Spread): ${spread}. Un poco atípico (muy junto o muy separado).` });
    }

    setAnalysisResults(results);
  };

  const handleInputChange = (index: number, value: string) => {
    if (!hasUserInteracted) setHasUserInteracted(true);
    const newCombination = [...combination];
    newCombination[index] = value === '' ? '' : parseInt(value, 10);
    setCombination(newCombination);
    setAnalysisResults([]);
  };

  return (
    <div>
      {error && <div className="validation-error">{error}</div>}
      <div className="combination-inputs">
        {combination.map((value, index) => (
          <input
            key={index}
            type="number"
            value={value}
            onChange={(e) => handleInputChange(index, e.target.value)}
            min="1"
            max="39"
          />
        ))}
      </div>
      <button onClick={handleAnalyze} disabled={error !== null}>
        Analizar
      </button>
      <ul className="analysis-results">
        {analysisResults.map((result, index) => (
          <li key={index} className={`result-item ${result.status}`}>
            {result.message}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default CombinationAnalyzer;