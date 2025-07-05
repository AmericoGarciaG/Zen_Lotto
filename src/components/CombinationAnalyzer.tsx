import { useState, useEffect } from 'react';
// Correctly import Draw as a type
import { getHistoricalData, type Draw } from '../api';

type AnalysisResult = {
  sum: number;
  message: string;
  color: 'green' | 'yellow' | 'red';
};

const CombinationAnalyzer = () => {
  const [combination, setCombination] = useState<(number | '')[]>(Array(6).fill(''));
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [hasUserInteracted, setHasUserInteracted] = useState(false);
  const [historicalData, setHistoricalData] = useState<Draw[]>([]);

  useEffect(() => {
    // Fetch data when the component mounts
    getHistoricalData().then(data => {
      setHistoricalData(data);
    });
  }, []);

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

  const getSumStats = () => {
    const sums = historicalData.map(draw => draw.combinacion.reduce((a, b) => a + b, 0));
    const sortedSums = [...sums].sort((a, b) => a - b);
    const q1 = sortedSums[Math.floor(sortedSums.length / 4)];
    const q3 = sortedSums[Math.floor(sortedSums.length * 3 / 4)];
    return { q1, q3, yellowLowerBound: q1 - 15, yellowUpperBound: q3 + 15 };
  };

  const handleAnalyze = () => {
    if (!validate(combination, 'onAnalyze') || historicalData.length === 0) {
      return;
    }

    const numbers = combination.map(num => Number(num));
    const sum = numbers.reduce((a, b) => a + b, 0);
    const { q1, q3, yellowLowerBound, yellowUpperBound } = getSumStats();

    let color: 'green' | 'yellow' | 'red';
    let message: string;

    if (sum >= q1 && sum <= q3) {
      color = 'green';
      message = `La suma de tu combinación (${sum}) está en el 50% central del histórico.`;
    } else if (sum >= yellowLowerBound && sum <= yellowUpperBound) {
      color = 'yellow';
      message = `La suma de tu combinación (${sum}) está cerca del rango más probable.`;
    } else {
      color = 'red';
      message = `La suma de tu combinación (${sum}) es poco común.`;
    }
    setResult({ sum, message, color });
  };

  const handleInputChange = (index: number, value: string) => {
    if (!hasUserInteracted) setHasUserInteracted(true);
    const newCombination = [...combination];
    newCombination[index] = value === '' ? '' : parseInt(value, 10);
    setCombination(newCombination);
    setResult(null);
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
      <button onClick={handleAnalyze} disabled={error !== null || historicalData.length === 0}>
        Analizar
      </button>
      {result && (
        <div className="result-message">
          <span className={`traffic-light ${result.color}`}>●</span>
          {result.message}
        </div>
      )}
    </div>
  );
};

export default CombinationAnalyzer;
