import { useState, useEffect, createRef } from 'react';
import { evaluarOmegaDetallado, type OmegaEvaluationResult } from '../api/omega';

interface AnalysisResult {
  criterion: 'Clase Omega' | 'Par/Impar';
  status: 'good' | 'neutral' | 'bad';
  message: string;
}

interface CombinationAnalyzerProps {
  // Ahora el tipo acepta 'omegaDistribution'
  setActiveChart: (chart: 'omegaDistribution' | null) => void;
}

const CombinationAnalyzer: React.FC<CombinationAnalyzerProps> = ({ setActiveChart }) => {
  const [combination, setCombination] = useState<(number | '')[]>(Array(6).fill(''));
  const [omegaResult, setOmegaResult] = useState<OmegaEvaluationResult | null>(null);
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
    const omegaEval = evaluarOmegaDetallado(numbers);

    if ('error' in omegaEval) {
      setError(`❌ Error: ${omegaEval.error}`);
      setOmegaResult(null);
      setAnalysisResults([]);
      return;
    }
    
    setOmegaResult(omegaEval);

    const results: AnalysisResult[] = [];

    // Omega Class Analysis
    if (omegaEval.esOmega) {
      results.push({ criterion: 'Clase Omega', status: 'good', message: `✅ ¡Clase Omega! Esta combinación cumple con los 3 criterios de afinidad histórica.` });
    } else {
        results.push({ criterion: 'Clase Omega', status: 'bad', message: `❌ No es Clase Omega. Cumple ${omegaEval.criteriosCumplidos} de 3 criterios.` });
    }

    // B. Even/Odd Analysis
    const evens = numbers.filter(n => n % 2 === 0).length;
    const odds = 6 - evens;
    if ([2, 3, 4].includes(evens)) {
      results.push({ criterion: 'Par/Impar', status: 'good', message: `🟢 Equilibrio: ${evens} Pares, ${odds} Impares. Esta distribución balanceada se encuentra en el 81.8% de los sorteos.` });
    } else {
      results.push({ criterion: 'Par/Impar', status: 'neutral', message: `🟡 Equilibrio: ${evens} Pares, ${odds} Impares. Esta distribución es menos común, ocurriendo solo en el 18.2% de los casos.` });
    }

    setAnalysisResults(results);
  };

  const handleInputChange = (index: number, value: string) => {
    if (!hasUserInteracted) setHasUserInteracted(true);
    const newCombination = [...combination];
    newCombination[index] = value === '' ? '' : parseInt(value, 10);
    setCombination(newCombination);
    setAnalysisResults([]);
    setOmegaResult(null);
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
    // Si se hace clic en 'Clase Omega', se activa el gráfico 'omegaDistribution'
    if (criterion === 'Clase Omega') {
      setActiveChart('omegaDistribution');
    } else {
      setActiveChart(null); // Desactivar para otros criterios
    }
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
      {omegaResult && (
        <div className="omega-details">
            <h4>Detalles de la Clase Omega:</h4>
            <ul>
                <li className={omegaResult.cumpleCuartetos ? 'good' : 'bad'}>Afinidad de Cuartetos: {omegaResult.afinidadCuartetos} (umbral: 10)</li>
                <li className={omegaResult.cumpleTercias ? 'good' : 'bad'}>Afinidad de Tercias: {omegaResult.afinidadTercias} (umbral: 74)</li>
                <li className={omegaResult.cumplePares ? 'good' : 'bad'}>Afinidad de Pares: {omegaResult.afinidadPares} (umbral: 459)</li>
            </ul>
        </div>
      )}
    </div>
  );
};

export default CombinationAnalyzer;
