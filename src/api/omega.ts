// Importa los datos directamente del archivo JSON.
import { FREQ_PARES, FREQ_TERCIAS, FREQ_CUARTETOS } from './omega-data.json';

// Criterios Omega puros
const UMBRAL_PARES = 459;
const UMBRAL_TERCIAS = 74;
const UMBRAL_CUARTETOS = 10;

export interface OmegaEvaluationResult {
    esOmega: boolean;
    combinacion: number[];
    afinidadPares: number;
    afinidadTercias: number;
    afinidadCuartetos: number;
    cumplePares: boolean;
    cumpleTercias: boolean;
    cumpleCuartetos: boolean;
    criteriosCumplidos: number;
}

// Función para generar todas las combinaciones de un array
function getCombinations(array: number[], k: number): number[][] {
    const results: number[][] = [];
    function combine(startIndex: number, currentCombination: number[]) {
        if (currentCombination.length === k) {
            results.push([...currentCombination]);
            return;
        }
        for (let i = startIndex; i < array.length; i++) {
            currentCombination.push(array[i]);
            combine(i + 1, currentCombination);
            currentCombination.pop();
        }
    }
    combine(0, []);
    return results;
}

// Las funciones de cálculo ahora usan las combinaciones generadas
function calcularAfinidadPares(combinacion: number[]): number {
    let total = 0;
    const pares = getCombinations(combinacion, 2);
    for (const par of pares) {
        const key = `(${par.join(',')})`;
        total += (FREQ_PARES as { [key: string]: number })[key] || 0;
    }
    return total;
}

function calcularAfinidadTercias(combinacion: number[]): number {
    let total = 0;
    const tercias = getCombinations(combinacion, 3);
    for (const tercia of tercias) {
        const key = `(${tercia.join(',')})`;
        total += (FREQ_TERCIAS as { [key: string]: number })[key] || 0;
    }
    return total;
}

function calcularAfinidadCuartetos(combinacion: number[]): number {
    let total = 0;
    const cuartetos = getCombinations(combinacion, 4);
    for (const cuarteto of cuartetos) {
        const key = `(${cuarteto.join(',')})`;
        total += (FREQ_CUARTETOS as { [key: string]: number })[key] || 0;
    }
    return total;
}

export function evaluarOmegaDetallado(combinacion: number[]): OmegaEvaluationResult | { error: string } {
    if (combinacion.length !== 6 || new Set(combinacion).size !== 6) {
        return { error: 'Debe ser una lista de 6 números únicos' };
    }
    if (!combinacion.every(num => num >= 1 && num <= 39)) {
        return { error: 'Los números deben estar entre 1 y 39' };
    }

    const comboOrdenada = [...combinacion].sort((a, b) => a - b);

    const afinidadCuartetos = calcularAfinidadCuartetos(comboOrdenada);
    const afinidadTercias = calcularAfinidadTercias(comboOrdenada);
    const afinidadPares = calcularAfinidadPares(comboOrdenada);

    const cumpleCuartetos = afinidadCuartetos >= UMBRAL_CUARTETOS;
    const cumpleTercias = afinidadTercias >= UMBRAL_TERCIAS;
    const cumplePares = afinidadPares >= UMBRAL_PARES;

    const criteriosCumplidos = (cumpleCuartetos ? 1 : 0) + (cumpleTercias ? 1 : 0) + (cumplePares ? 1 : 0);
    const esOmega = criteriosCumplidos === 3;

    return {
        esOmega,
        combinacion: comboOrdenada,
        afinidadPares,
        afinidadTercias,
        afinidadCuartetos,
        cumplePares,
        cumpleTercias,
        cumpleCuartetos,
        criteriosCumplidos,
    };
}
