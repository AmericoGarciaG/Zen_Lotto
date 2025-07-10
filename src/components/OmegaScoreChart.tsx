// src/components/OmegaScoreChart.tsx
import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import jsonData from '../api/db.json';
import './DistributionCharts.css';

const OmegaScoreChart: React.FC = () => {
  const omegaRecords = jsonData.melate_retro.filter(record => record.clase_omega === 1);

  return (
    <div className="distribution-container">
        <h3>Omega Score Distribution</h3>
        <div className="chart-section">
            <h4>Based on Historical Omega-Class Draws</h4>
            <ResponsiveContainer width="100%" height={400}>
            <BarChart
                data={omegaRecords}
                margin={{
                top: 20, right: 30, left: 20, bottom: 5,
                }}
            >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="concurso" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="omega_score" fill="#8884d8" />
            </BarChart>
            </ResponsiveContainer>
        </div>
    </div>
  );
};

export default OmegaScoreChart;
