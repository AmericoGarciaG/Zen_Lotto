// src/components/OmegaScoreVsPrizeChart.tsx
import React from 'react';
import { ScatterChart, Scatter, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import jsonData from '../api/db.json';
import './DistributionCharts.css';

const OmegaScoreVsPrizeChart: React.FC = () => {
  const winnerRecords = jsonData.melate_retro
    .filter((record, index, records) => {
        // A winner is a record where the *next* chronological contest (previous in the array) has a reset prize pool
        const nextContestRecord = records[index - 1];
        return nextContestRecord ? parseFloat(nextContestRecord.bolsa_acumulada) === 5000000 : false;
    })
    .map(record => ({
        ...record,
        bolsa_acumulada_numero: parseFloat(record.bolsa_acumulada.replace(/[^0-9.-]+/g,""))
    }));

  return (
    <div className="distribution-container">
        <h3>Omega Score vs. Bolsa Acumulada (Sorteos Ganadores)</h3>
        <div className="chart-section">
            <h4>Comparativa de Sorteos con Premio Mayor</h4>
            <ResponsiveContainer width="100%" height={400}>
            <ScatterChart
                margin={{
                top: 20, right: 30, left: 20, bottom: 20,
                }}
            >
                <CartesianGrid />
                <XAxis type="number" dataKey="omega_score" name="Omega Score" unit="" />
                <YAxis 
                    type="number" 
                    dataKey="bolsa_acumulada_numero" 
                    name="Bolsa Acumulada" 
                    unit=" MXN"
                    tickFormatter={(value) => new Intl.NumberFormat('es-MX', { notation: 'compact', compactDisplay: 'short' }).format(value)}
                />
                <Tooltip 
                    cursor={{ strokeDasharray: '3 3' }} 
                    formatter={(value, name) => {
                        if (name === 'Bolsa Acumulada') {
                            return new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' }).format(value as number);
                        }
                        return value;
                    }}
                />
                <Legend />
                <Scatter name="Sorteos Ganadores" data={winnerRecords} fill="#8884d8" />
            </ScatterChart>
            </ResponsiveContainer>
        </div>
    </div>
  );
};

export default OmegaScoreVsPrizeChart;
