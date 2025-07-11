// src/api/index.ts

import db from './db.json';
import type { Draw } from './types'; // Import the single source of truth

/**
 * Fetches the historical lottery data.
 * This function now correctly reads the data from the local db.json file
 * and uses the centralized Draw interface.
 */
export const getHistoricalData = (): Promise<Draw[]> => {
  return new Promise((resolve) => {
    // Simulate a network delay
    setTimeout(() => {
      // The data is under the 'melate_retro' key
      resolve(db.melate_retro as Draw[]); 
    }, 200); // 200ms delay
  });
};
