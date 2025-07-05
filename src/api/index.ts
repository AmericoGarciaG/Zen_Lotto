// src/api/index.ts

import db from './db.json';

// Define the structure of a single draw
export interface Draw {
  concurso: number;
  fecha: string;
  combinacion: number[];
  adicional: number;
  bolsa: number;
}

/**
 * Fetches the historical lottery data.
 * In the future, this function could fetch from a real backend API.
 * For now, it returns data from a local JSON file.
 */
export const getHistoricalData = (): Promise<Draw[]> => {
  return new Promise((resolve) => {
    // Simulate a network delay
    setTimeout(() => {
      resolve(db.historicalData as Draw[]);
    }, 200); // 200ms delay
  });
};
