import { useState, useEffect } from 'react';
import { getHistoricalData, type Draw } from '../api';

const SumOverTimeChart = () => {
  const [allDraws, setAllDraws] = useState<Draw[]>([]);
  const [yearlyChartData, setYearlyChartData] = useState<{ year: number; averageSum: number }[]>([]);
  const [monthlyChartData, setMonthlyChartData] = useState<{ month: number; averageSum: number }[]>([]);
  const [selectedYear, setSelectedYear] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // --- Data Fetching and Processing ---
  useEffect(() => {
    getHistoricalData().then(fetchedDraws => {
      setAllDraws(fetchedDraws);
      processYearlyData(fetchedDraws);
      setIsLoading(false);
    });
  }, []);

  const processYearlyData = (draws: Draw[]) => {
    const sumsByYear: { [year: number]: { totalSum: number; count: number } } = {};
    draws.forEach(draw => {
      const year = new Date(draw.fecha).getFullYear();
      if (!year) return;
      const sum = draw.combinacion.reduce((a, b) => a + b, 0);
      if (!sumsByYear[year]) {
        sumsByYear[year] = { totalSum: 0, count: 0 };
      }
      sumsByYear[year].totalSum += sum;
      sumsByYear[year].count++;
    });

    const finalYearlyData = Object.keys(sumsByYear).map(yearStr => {
      const year = parseInt(yearStr, 10);
      const { totalSum, count } = sumsByYear[year];
      return { year, averageSum: Math.round(totalSum / count) };
    }).sort((a, b) => a.year - b.year);

    setYearlyChartData(finalYearlyData);
  };

  const processMonthlyData = (year: number) => {
    const yearDraws = allDraws.filter(draw => new Date(draw.fecha).getFullYear() === year);
    const sumsByMonth: { [month: number]: { totalSum: number; count: number } } = {};

    yearDraws.forEach(draw => {
      const month = new Date(draw.fecha).getMonth(); // 0-11
      const sum = draw.combinacion.reduce((a, b) => a + b, 0);
      if (!sumsByMonth[month]) {
        sumsByMonth[month] = { totalSum: 0, count: 0 };
      }
      sumsByMonth[month].totalSum += sum;
      sumsByMonth[month].count++;
    });

    const finalMonthlyData = Object.keys(sumsByMonth).map(monthStr => {
      const month = parseInt(monthStr, 10);
      const { totalSum, count } = sumsByMonth[month];
      return { month, averageSum: Math.round(totalSum / count) };
    }).sort((a, b) => a.month - b.month);
    
    setMonthlyChartData(finalMonthlyData);
    setSelectedYear(year);
  };
  
  // --- Loading State ---
  if (isLoading) {
    return (
      <section>
        <h2>Promedio de Suma</h2>
        <p>Cargando y procesando datos...</p>
      </section>
    );
  }

  // --- Render Logic ---
  const chartHeight = 220;
  const chartWidth = 500;
  const padding = 40;
  const labelOffset = 10;
  const minSum = 21;
  const maxSum = 219;
  const sumRange = maxSum - minSum;
  const getY = (sum: number) => chartHeight - padding - ((sum - minSum) / sumRange) * (chartHeight - 2 * padding);

  // Constants for statistical lines
  const typicalLowerBound = 95;
  const typicalUpperBound = 145;
  const overallAverage = 120;

  // --- Yearly Chart ---
  if (!selectedYear) {
    const years = yearlyChartData.map(d => d.year);
    const minYear = Math.min(...years);
    const maxYear = Math.max(...years);
    const yearRange = (maxYear - minYear) > 0 ? (maxYear - minYear) : 1;
    const getXYear = (year: number) => padding + ((year - minYear) / yearRange) * (chartWidth - 2 * padding - labelOffset);
    const yearLabelIncrement = yearRange > 12 ? 3 : (yearRange > 6 ? 2 : 1);
    const yearsToDisplay = years.filter(year => (year - minYear) % yearLabelIncrement === 0);

    return (
      <section>
        <h2>Promedio de Suma por Año</h2>
        <svg viewBox={`0 0 ${chartWidth} ${chartHeight}`} aria-labelledby="title-yearly" role="img">
          {/* ... (statistical lines) ... */}
          <line x1={padding} y1={getY(overallAverage)} x2={chartWidth - padding} y2={getY(overallAverage)} stroke="#a7a7a7" strokeDasharray="2,2" />
          <text x={chartWidth - padding + 3} y={getY(overallAverage) + 3} fontSize="10" fill="#a7a7a7" textAnchor="start">Media</text>
          
          <line x1={padding} y1={getY(typicalLowerBound)} x2={chartWidth - padding} y2={getY(typicalLowerBound)} stroke="#555" strokeDasharray="4,3"/>
          <text x={chartWidth - padding + 3} y={getY(typicalLowerBound) + 3} fontSize="10" fill="#a7a7a7" textAnchor="start">95</text>
  
          <line x1={padding} y1={getY(typicalUpperBound)} x2={chartWidth - padding} y2={getY(typicalUpperBound)} stroke="#555" strokeDasharray="4,3"/>
          <text x={chartWidth - padding + 3} y={getY(typicalUpperBound) + 3} fontSize="10" fill="#a7a7a7" textAnchor="start">145</text>

          {yearlyChartData.map(({ year, averageSum }) => (
            <g key={year} onClick={() => processMonthlyData(year)} style={{ cursor: 'pointer' }}>
              <circle cx={getXYear(year)} cy={getY(averageSum)} r="3.5" fill={averageSum >= typicalLowerBound && averageSum <= typicalUpperBound ? '#646cff' : '#ffc107'}>
                <title>{`Año: ${year}
Promedio: ${averageSum}`}</title>
              </circle>
            </g>
          ))}
          {yearsToDisplay.map((year) => (
            <text key={year} x={getXYear(year)} y={chartHeight - padding + 15} fontSize="10" textAnchor="middle" fill="#a7a7a7">{year}</text>
          ))}
        </svg>
      </section>
    );
  }

  // --- Monthly Chart ---
  const monthNames = ["Ene", "Feb", "Mar", "Abr", "May", "Jun", "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"];
  const getXMonth = (month: number) => padding + (month / 11) * (chartWidth - 2 * padding - labelOffset);

  return (
    <section>
      <h2>Promedio de Suma para {selectedYear}</h2>
      <button 
        onClick={() => setSelectedYear(null)} 
        style={{ 
          background: 'none',
          border: 'none',
          color: '#a7a7a7',
          cursor: 'pointer',
          fontSize: '12px',
          marginBottom: '1rem',
        }}
      >
        ← Volver a la vista anual
      </button>
      <svg viewBox={`0 0 ${chartWidth} ${chartHeight}`} aria-labelledby="title-monthly" role="img">
         {/* ... (statistical lines) ... */}
         <line x1={padding} y1={getY(overallAverage)} x2={chartWidth - padding} y2={getY(overallAverage)} stroke="#a7a7a7" strokeDasharray="2,2" />
        <text x={chartWidth - padding + 3} y={getY(overallAverage) + 3} fontSize="10" fill="#a7a7a7" textAnchor="start">Media</text>
        
        <line x1={padding} y1={getY(typicalLowerBound)} x2={chartWidth - padding} y2={getY(typicalLowerBound)} stroke="#555" strokeDasharray="4,3"/>
        <text x={chartWidth - padding + 3} y={getY(typicalLowerBound) + 3} fontSize="10" fill="#a7a7a7" textAnchor="start">95</text>

        <line x1={padding} y1={getY(typicalUpperBound)} x2={chartWidth - padding} y2={getY(typicalUpperBound)} stroke="#555" strokeDasharray="4,3"/>
        <text x={chartWidth - padding + 3} y={getY(typicalUpperBound) + 3} fontSize="10" fill="#a7a7a7" textAnchor="start">145</text>
        
        {monthlyChartData.map(({ month, averageSum }) => (
          <g key={month}>
            <circle cx={getXMonth(month)} cy={getY(averageSum)} r="3.5" fill={averageSum >= typicalLowerBound && averageSum <= typicalUpperBound ? '#646cff' : '#ffc107'}>
              <title>{`Mes: ${monthNames[month]}
Promedio: ${averageSum}`}</title>
            </circle>
          </g>
        ))}
        {monthlyChartData.map(({ month }) => (
          <text key={month} x={getXMonth(month)} y={chartHeight - padding + 15} fontSize="10" textAnchor="middle" fill="#a7a7a7">{monthNames[month]}</text>
        ))}
      </svg>
    </section>
  );
};

export default SumOverTimeChart;