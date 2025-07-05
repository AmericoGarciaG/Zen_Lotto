// src/api/types.ts

/**
 * Defines the structure for a single lottery draw record.
 */
export interface Draw {
  concurso: number;
  fecha: string;
  combinacion: number[];
  adicional: number;
  bolsa: number;
}
