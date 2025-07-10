// src/components/DatabaseViewer.tsx
import React, { useState, useEffect } from 'react';
import jsonData from '../api/db.json';
import './DatabaseViewer.css';

interface MelateRetroRecord {
  id: number;
  concurso: number;
  fecha: string;
  r1: number;
  r2: number;
  r3: number;
  r4: number;
  r5: number;
  r6: number;
  bolsa_acumulada: string;
  clase_omega: number;
  afinidad_total: number;
  afinidad_cuartetos: number;
  afinidad_tercias: number;
  afinidad_pares: number;
  omega_score: number;
}

const RECORDS_PER_PAGE = 20;

const Pagination: React.FC<{
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}> = ({ currentPage, totalPages, onPageChange }) => {
  const getPaginationGroup = () => {
    let start = Math.floor((currentPage - 1) / 5) * 5;
    const end = start + 5;
    const group = [];
    for (let i = start + 1; i <= end && i <= totalPages; i++) {
      group.push(i);
    }
    return group;
  };

  return (
    <div className="pagination">
      <button onClick={() => onPageChange(1)} disabled={currentPage === 1}>
        « Primera
      </button>
      <button onClick={() => onPageChange(currentPage - 1)} disabled={currentPage === 1}>
        ‹ Anterior
      </button>
      {getPaginationGroup().map(item => (
        <button
          key={item}
          onClick={() => onPageChange(item)}
          className={currentPage === item ? 'active' : ''}
        >
          {item}
        </button>
      ))}
      <button onClick={() => onPageChange(currentPage + 1)} disabled={currentPage === totalPages}>
        Siguiente ›
      </button>
      <button onClick={() => onPageChange(totalPages)} disabled={currentPage === totalPages}>
        Última »
      </button>
    </div>
  );
};

const DatabaseViewer: React.FC = () => {
  const [records, setRecords] = useState<MelateRetroRecord[]>([]);
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    // The records are already sorted by 'concurso' descending in the JSON.
    setRecords(jsonData.melate_retro);
  }, []);

  const totalPages = Math.ceil(records.length / RECORDS_PER_PAGE);
  const startIndex = (currentPage - 1) * RECORDS_PER_PAGE;
  const currentRecords = records.slice(startIndex, startIndex + RECORDS_PER_PAGE);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  };

  const formatBolsa = (bolsa: string) => {
    const number = parseFloat(bolsa);
    if (isNaN(number)) {
      return bolsa;
    }
    return new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency: 'MXN',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(number);
  };

  return (
    <div className="database-viewer">
      <h2>Melate Retro - Registros Históricos</h2>
      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={setCurrentPage}
      />
      <table>
        <thead>
          <tr>
            <th>Concurso</th>
            <th>Fecha</th>
            <th>R1</th>
            <th>R2</th>
            <th>R3</th>
            <th>R4</th>
            <th>R5</th>
            <th>R6</th>
            <th>Bolsa acumulada</th>
            <th>Clase Omega</th>
            <th>Omega Score</th>
            <th>Afinidad Total</th>
            <th>Afinidad Cuartetos</th>
            <th>Afinidad Tercias</th>
            <th>Afinidad Pares</th>
          </tr>
        </thead>
        <tbody>
          {currentRecords.map((record, index) => {
            const recordIndexInFullArray = startIndex + index;
            // The next contest in chronological order is the previous item in the array
            const nextContestRecord = records[recordIndexInFullArray - 1];
            const isWinnerBolsa = nextContestRecord 
              ? parseFloat(nextContestRecord.bolsa_acumulada) === 5000000 
              : false;

            return (
              <tr key={record.id}>
                <td>{record.concurso}</td>
                <td>{formatDate(record.fecha)}</td>
                <td>{record.r1}</td>
                <td>{record.r2}</td>
                <td>{record.r3}</td>
                <td>{record.r4}</td>
                <td>{record.r5}</td>
                <td>{record.r6}</td>
                <td className={isWinnerBolsa ? 'bolsa-ganadora' : ''}>
                  {formatBolsa(record.bolsa_acumulada)}
                </td>
                <td className={record.clase_omega ? 'omega' : 'no-omega'}>
                  {record.clase_omega ? 'Sí' : 'No'}
                </td>
                <td>{record.omega_score.toFixed(4)}</td>
                <td>{record.afinidad_total}</td>
                <td>{record.afinidad_cuartetos}</td>
                <td>{record.afinidad_tercias}</td>
                <td>{record.afinidad_pares}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={setCurrentPage}
      />
    </div>
  );
};

export default DatabaseViewer;
