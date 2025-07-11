import { useState, useEffect, createRef } from 'react';
import { evaluarOmegaDetallado, type OmegaEvaluationResult } from '../api/omega';

interface AnalysisResult {
  criterion: 'Clase Omega';
  status: 'good' | 'bad';
  message: string;
}

const CombinationAnalyzer: React.FC = () => {
  const [combination, setCombination] = useState<(number | '')[]>(Array(6).fill(''));
  const [omegaResult, setOmegaResult] = useState<OmegaEvaluationResult | null>(null);
  const [analysisResults, setAnalysisResults] = useState<AnalysisResult[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [hasUserInteracted, setHasUserInteracted] = useState(false);
  const inputRefs = Array(6).fill(0).map(() => createRef<HTMLInputElement>());
  const analyzeButtonRef = createRef<HTMLButtonElement>();

  useEffect(() => {
    if (hasUserInteracted) {
      validate(combination);
    }
  }, [combination, hasUserInteracted]);

  const validate = (combo: (number | '')[]) => {
    const filledNumbers = combo.filter(n => n !== '').map(Number);
    if (filledNumbers.some(num => num < 1 || num > 39)) {
      setError('❌ Los números deben estar entre 1 y 39.');
      return false;
    }
    if (new Set(filledNumbers).size !== filledNumbers.length) {
      setError('❌ No se permiten números repetidos.');
      return false;
    }
    setError(null);
    return true;
  };

  const handleAnalyze = () => {
    const filledNumbers = combination.filter(n => n !== '').map(Number);
    if (filledNumbers.length < 6) {
        setError('❌ Por favor, ingresa los 6 números.');
        return;
    }
    if (!validate(combination)) {
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

    if (omegaEval.esOmega) {
      results.push({ criterion: 'Clase Omega', status: 'good', message: `✅ ¡Clase Omega! Esta combinación cumple con los 3 criterios de afinidad histórica.` });
    } else {
        results.push({ criterion: 'Clase Omega', status: 'bad', message: `❌ No es Clase Omega. Cumple ${omegaEval.criteriosCumplidos} de 3 criterios.` });
    }

    setAnalysisResults(results);
  };

  const handleGenerarOmega = () => {
    // Lógica para generar una combinación Omega
    console.log("Generando Omega...");
  };

  const handleRegistrarOmega = () => {
    // Lógica para registrar la combinación Omega
    console.log("Registrando Omega...");
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

  return (
    <div className="analyzer-container">
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
      <div className="button-group">
        <button ref={analyzeButtonRef} onClick={handleAnalyze} disabled={error !== null}>
          Analizar
        </button>
        <button onClick={handleGenerarOmega}>
          Generar Omega
        </button>
        <button onClick={handleRegistrarOmega}>
          Registrar Omega
        </button>
      </div>
      <ul className="analysis-results">
        {analysisResults.map((result, index) => (
          <li key={index} className={`result-item ${result.status}`}>
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
