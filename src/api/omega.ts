import { FREQ_PARES, FREQ_TERCIAS, FREQ_CUARTETOS } from './omega-data';

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

function calcularAfinidadPares(combinacion: number[]): number {
    let total = 0;
    for (let i = 0; i < combinacion.length; i++) {
        for (let j = i + 1; j < combinacion.length; j++) {
            const par = `(${combinacion[i]},${combinacion[j]})`;
            total += FREQ_PARES[par] || 0;
        }
    }
    return total;
}

function calcularAfinidadTercias(combinacion: number[]): number {
    let total = 0;
    for (let i = 0; i < combinacion.length; i++) {
        for (let j = i + 1; j < combinacion.length; j++) {
            for (let k = j + 1; k < combinacion.length; k++) {
                const tercia = `(${combinacion[i]},${combinacion[j]},${combinacion[k]})`;
                total += FREQ_TERCIAS[tercia] || 0;
            }
        }
    }
    return total;
}

function calcularAfinidadCuartetos(combinacion: number[]): number {
    let total = 0;
    for (let i = 0; i < combinacion.length; i++) {
        for (let j = i + 1; j < combinacion.length; j++) {
            for (let k = j + 1; k < combinacion.length; k++) {
                for (let l = k + 1; l < combinacion.length; l++) {
                    const cuarteto = `(${combinacion[i]},${combinacion[j]},${combinacion[k]},${combinacion[l]})`;
                    total += FREQ_CUARTETOS[cuarteto] || 0;
                }
            }
        }
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

    // 1. Calcular todas las afinidades primero
    const afinidadCuartetos = calcularAfinidadCuartetos(comboOrdenada);
    const afinidadTercias = calcularAfinidadTercias(comboOrdenada);
    const afinidadPares = calcularAfinidadPares(comboOrdenada);

    // 2. Evaluar cada criterio
    const cumpleCuartetos = afinidadCuartetos >= UMBRAL_CUARTETOS;
    const cumpleTercias = afinidadTercias >= UMBRAL_TERCIAS;
    const cumplePares = afinidadPares >= UMBRAL_PARES;

    // 3. Contar criterios cumplidos
    let criteriosCumplidos = 0;
    if (cumpleCuartetos) criteriosCumplidos++;
    if (cumpleTercias) criteriosCumplidos++;
    if (cumplePares) criteriosCumplidos++;
    
    // 4. Determinar si es Clase Omega (deben cumplirse los 3)
    const esOmega = cumpleCuartetos && cumpleTercias && cumplePares;

    // 5. Devolver siempre el resultado detallado completo
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
