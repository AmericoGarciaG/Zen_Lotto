import { useState, useEffect, createRef } from 'react';

interface AnalysisResult {
  criterion: 'Suma' | 'Par/Impar' | 'Distribución por Grupos' | 'Rango';
  status: 'good' | 'neutral' | 'bad';
  message: string;
}

interface CombinationAnalyzerProps {
  setActiveChart: (chart: 'sum' | 'oddEven' | 'groups' | 'spread') => void;
}

const CombinationAnalyzer: React.FC<CombinationAnalyzerProps> = ({ setActiveChart }) => {
  const [combination, setCombination] = useState<(number | '')[]>(Array(6).fill(''));
  const [analysisResults, setAnalysisResults] = useState<AnalysisResult[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [hasUserInteracted, setHasUserInteracted] = useState(false);
  const inputRefs = Array(6).fill(0).map(() => createRef<HTMLInputElement>());
  const analyzeButtonRef = createRef<HTMLButtonElement>();

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

    // C. Group Distribution Analysis
    const groups = new Set(numbers.map(n => {
      if (n >= 1 && n <= 9) return 1;
      if (n >= 10 && n <= 19) return 2;
      if (n >= 20 && n <= 29) return 3;
      return 4;
    }));
    const numberOfGroups = groups.size;
    if (numberOfGroups >= 3) {
      results.push({ criterion: 'Distribución por Grupos', status: 'good', message: `✅ Distribución: ${numberOfGroups} grupos. Estructura balanceada.` });
    } else if (numberOfGroups === 2) {
      results.push({ criterion: 'Distribución por Grupos', status: 'bad', message: `❌ Distribución: ${numberOfGroups} grupos. Estructura muy atípica.` });
    } else {
      results.push({ criterion: 'Distribución por Grupos', status: 'bad', message: `❌ Distribución: 1 grupo. Estructura extremadamente rara.` });
    }

    // D. Spread Analysis
    const min = Math.min(...numbers);
    const max = Math.max(...numbers);
    const spread = max - min;
    if (spread >= 25 && spread <= 35) {
      results.push({ criterion: 'Rango', status: 'good', message: `✅ Rango: ${spread}. La diferencia entre el máximo ${max} y el mínimo ${min} es ideal.` });
    } else {
      results.push({ criterion: 'Rango', status: 'neutral', message: `🟡 Rango: ${spread}. La diferencia entre el máximo ${max} y el mínimo ${min} es un poco atípica.` });
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

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>, index: number) => {
    if (e.key === 'Enter') {
      if (index < 5) {
        inputRefs[index + 1].current?.focus();
      } else {
        analyzeButtonRef.current?.focus();
      }
    }
  };

  const handleCriterionClick = (criterion: AnalysisResult['criterion']) => {
    const chartMap = {
      'Suma': 'sum',
      'Par/Impar': 'oddEven',
      'Distribución por Grupos': 'groups',
      'Rango': 'spread',
    };
    setActiveChart(chartMap[criterion] as 'sum' | 'oddEven' | 'groups' | 'spread');
  };

  return (
    <div>
      {error && <div className="validation-error">{error}</div>}
      <div className="combination-inputs">
        {combination.map((value, index) => (
          <input
            key={index}
            ref={inputRefs[index]}
            type="number"
            value={value}
            onChange={(e) => handleInputChange(index, e.target.value)}
            onKeyDown={(e) => handleKeyDown(e, index)}
            min="1"
            max="39"
          />
        ))}
      </div>
      <button ref={analyzeButtonRef} onClick={handleAnalyze} disabled={error !== null}>
        Analizar
      </button>
      <ul className="analysis-results">
        {analysisResults.map((result, index) => (
          <li key={index} className={`result-item ${result.status}`} onClick={() => handleCriterionClick(result.criterion)}>
            {result.message}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default CombinationAnalyzer;