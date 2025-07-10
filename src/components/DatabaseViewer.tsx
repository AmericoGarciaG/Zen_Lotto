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
  clase_omega: number;
}

const RECORDS_PER_PAGE = 15;

const DatabaseViewer: React.FC = () => {
  const [records, setRecords] = useState<MelateRetroRecord[]>([]);
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    setRecords(jsonData.melate_retro);
  }, []);

  const totalPages = Math.ceil(records.length / RECORDS_PER_PAGE);
  const startIndex = (currentPage - 1) * RECORDS_PER_PAGE;
  const currentRecords = records.slice(startIndex, startIndex + RECORDS_PER_PAGE);

  const goToPage = (page: number) => {
    setCurrentPage(page);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  };

  return (
    <div className="database-viewer">
      <h2>Melate Retro - Registros Históricos</h2>
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
            <th>Clase Omega</th>
          </tr>
        </thead>
        <tbody>
          {currentRecords.map(record => (
            <tr key={record.id}>
              <td>{record.concurso}</td>
              <td>{formatDate(record.fecha)}</td>
              <td>{record.r1}</td>
              <td>{record.r2}</td>
              <td>{record.r3}</td>
              <td>{record.r4}</td>
              <td>{record.r5}</td>
              <td>{record.r6}</td>
              <td className={record.clase_omega ? 'omega' : 'no-omega'}>
                {record.clase_omega ? 'Sí' : 'No'}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <div className="pagination">
        {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
          <button
            key={page}
            onClick={() => goToPage(page)}
            className={currentPage === page ? 'active' : ''}
          >
            {page}
          </button>
        ))}
      </div>
    </div>
  );
};

export default DatabaseViewer;
