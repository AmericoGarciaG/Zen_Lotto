import { useState, useEffect } from 'react';

const CombinationAnalyzer = () => {
  const [combination, setCombination] = useState<(number | '')[]>(Array(6).fill(''));
  const [result, setResult] = useState<{ passed: boolean; message: string } | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    validate(combination);
  }, [combination]);

  const validate = (combo: (number | '')[]) => {
    // 1. Completitud
    if (combo.some(num => num === '')) {
      setError('❌ Por favor, ingresa los 6 números.');
      setResult(null);
      return false;
    }

    const numbers = combo.map(num => Number(num));

    // 2. Rango
    if (numbers.some(num => num < 1 || num > 39)) {
      setError('❌ Todos los números deben estar entre 1 y 39.');
      setResult(null);
      return false;
    }

    // 3. Unicidad
    if (new Set(numbers).size !== numbers.length) {
      setError('❌ No se permiten números repetidos.');
      setResult(null);
      return false;
    }

    setError(null);
    return true;
  };


  const handleAnalyze = () => {
    if (!validate(combination)) {
      return;
    }

    const numbers = combination.map(num => Number(num));
    const sum = numbers.reduce((a, b) => a + b, 0);

    if (sum >= 95 && sum <= 145) {
      setResult({
        passed: true,
        message: `✅ Suma Válida: ${sum}. Tu combinación tiene una suma que se encuentra dentro del rango estadísticamente más probable (95-145).`
      });
    } else {
      setResult({
        passed: false,
        message: `❌ Suma Atípica: ${sum}. La suma de tu combinación es poco común en el histórico de sorteos.`
      });
    }
  };

  const handleInputChange = (index: number, value: string) => {
    const newCombination = [...combination];
    newCombination[index] = value === '' ? '' : parseInt(value, 10);
    setCombination(newCombination);
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
      {result && (
        <div className={`result-message ${result.passed ? 'passed' : 'failed'}`}>
          {result.message}
        </div>
      )}
    </div>
  );
};

export default CombinationAnalyzer;
