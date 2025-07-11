// src/api/types.ts

/**
 * Defines the structure for a single historical lottery draw record.
 * This is the single source of truth for this data structure.
 */
export interface Draw {
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
  clase_omega: number; // Corrected to number
  afinidad_cuartetos: number;
  afinidad_tercias: number;
  afinidad_pares: number;
  omega_score: number;
}
