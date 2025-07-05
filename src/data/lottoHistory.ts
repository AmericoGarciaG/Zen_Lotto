interface Draw {
  fecha: string; // Formato 'DD/MM/YYYY'
  combinacion: number[]; // Array de 6 números
  adicional: number;
}

export const historicalData: Draw[] = [
  { fecha: '01/01/2023', combinacion: [5, 12, 23, 28, 33, 40], adicional: 7 },
  { fecha: '08/01/2023', combinacion: [2, 18, 22, 30, 39, 41], adicional: 11 },
  { fecha: '15/01/2023', combinacion: [9, 15, 21, 25, 36, 42], adicional: 3 },
  { fecha: '22/01/2023', combinacion: [1, 10, 19, 29, 31, 38], adicional: 14 },
  { fecha: '29/01/2023', combinacion: [7, 13, 24, 34, 37, 43], adicional: 6 },
  { fecha: '05/02/2023', combinacion: [3, 11, 20, 26, 32, 44], adicional: 1 },
  { fecha: '12/02/2023', combinacion: [8, 14, 27, 35, 45, 46], adicional: 4 },
  { fecha: '19/02/2023', combinacion: [4, 16, 17, 28, 30, 48], adicional: 10 },
  { fecha: '26/02/2023', combinacion: [6, 19, 21, 23, 33, 47], adicional: 2 },
  { fecha: '05/03/2023', combinacion: [10, 13, 22, 29, 38, 41], adicional: 12 },
  { fecha: '12/03/2023', combinacion: [1, 9, 18, 27, 36, 45], adicional: 5 },
  { fecha: '19/03/2023', combinacion: [11, 15, 25, 34, 39, 40], adicional: 13 },
  { fecha: '26/03/2023', combinacion: [2, 8, 17, 26, 37, 44], adicional: 9 },
  { fecha: '02/04/2023', combinacion: [3, 12, 20, 31, 35, 42], adicional: 15 },
  { fecha: '09/04/2023', combinacion: [5, 14, 24, 28, 32, 47], adicional: 8 },
];
