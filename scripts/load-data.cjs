// scripts/load-data.cjs
console.log('--- Script de Carga de Datos (Modo Automático) ---');

process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";

const axios = require('axios');
const sqlite3 = require('sqlite3').verbose();
const { parse } = require('csv-parse/sync');
const path = require('path');
const fs = require('fs');

// --- CONFIGURACIÓN ---
const DB_PATH = path.resolve(__dirname, '../lottodata.db');
const JSON_OUTPUT_PATH = path.resolve(__dirname, '../public/db.json');
const OMEGA_DATA_PATH = path.resolve(__dirname, '../src/api/omega-data.json');
const MELATE_RETRO_URL = 'https://www.loterianacional.gob.mx/Home/Historicos?ARHP=TQBlAGwAYQB0AGUALQBSAGUAdAByAG8A';
const TABLE_NAME = 'historicos';

const UMBRAL_PARES = 459;
const UMBRAL_TERCIAS = 74;
const UMBRAL_CUARTETOS = 10;

// --- FUNCIONES DE UTILIDAD Y CÁLCULO ---
function formatDate(dateStr) {
    if (!dateStr || typeof dateStr !== 'string') return null;
    const parts = dateStr.split('/');
    if (parts.length !== 3) return null;
    const [day, month, year] = parts;
    return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
}

function getCombinations(array, k) {
    const results = [];
    function combine(startIndex, currentCombination) {
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

function createFrequencyMap(records, combinationSize) {
    const freqMap = new Map();
    for (const record of records) {
        const combination = [record.r1, record.r2, record.r3, record.r4, record.r5, record.r6];
        const subCombinations = getCombinations(combination, combinationSize);
        for (const sub of subCombinations) {
            const key = `(${sub.sort((a, b) => a - b).join(',')})`;
            freqMap.set(key, (freqMap.get(key) || 0) + 1);
        }
    }
    return freqMap;
}

function calculateAffinity(combination, freqMap, combinationSize) {
    let affinity = 0;
    const subCombinations = getCombinations(combination, combinationSize);
    for (const sub of subCombinations) {
        const key = `(${sub.sort((a, b) => a - b).join(',')})`;
        affinity += freqMap.get(key) || 0;
    }
    return affinity;
}

// --- FUNCIÓN PRINCIPAL ---
async function main() {
    
    // --- LÓGICA DE DECISIÓN MEJORADA ---
    const db = new sqlite3.Database(DB_PATH);
    const getRowCount = () => new Promise((resolve, reject) => {
        db.get(`SELECT count(*) as count FROM ${TABLE_NAME}`, (err, row) => {
            // Si la tabla no existe, el error es esperado, devolvemos 0.
            if (err && err.message.includes('no such table')) {
                return resolve(0);
            }
            if (err) {
                return reject(err);
            }
            resolve(row.count);
        });
    });

    const rowCount = await getRowCount();
    const isRebuild = rowCount === 0;
    
    console.log(isRebuild ? `[INFO] Base de datos vacía. Se ejecutará una reconstrucción completa.` : `[INFO] ${rowCount} registros encontrados. Se intentará una actualización.`);

    try {
        console.log('[PASO 1/5] Descargando CSV...');
        const response = await axios.get(MELATE_RETRO_URL, { headers: { 'User-Agent': 'Mozilla/5.0' } });
        
        const allCsvRecords = parse(response.data, { columns: true, skip_empty_lines: true, trim: true, relax_column_count: true })
            .map(r => {
                const concurso = parseInt(r.CONCURSO, 10);
                if (isNaN(concurso)) return null;
                return {
                    concurso, fecha: formatDate(r.FECHA),
                    r1: parseInt(r.R1, 10), r2: parseInt(r.R2, 10), r3: parseInt(r.R3, 10),
                    r4: parseInt(r.R4, 10), r5: parseInt(r.R5, 10), r6: parseInt(r.R6, 10),
                    bolsa_acumulada: r.BOLSA
                };
            }).filter(Boolean);

        console.log(`[ÉXITO] CSV descargado y validado con ${allCsvRecords.length} registros limpios.`);

        let recordsToProcess = allCsvRecords;
        let freqPares, freqTercias, freqCuartetos;

        if (!isRebuild) {
            const lastConcursoRow = await new Promise((res, rej) => db.get(`SELECT MAX(concurso) as max FROM ${TABLE_NAME}`, (err, row) => err ? rej(err) : res(row)));
            const lastConcurso = lastConcursoRow.max;
            
            recordsToProcess = allCsvRecords.filter(r => r.concurso > lastConcurso);
            
            if (recordsToProcess.length === 0) {
                console.log('[INFO] No hay sorteos nuevos para actualizar.');
                db.close();
                return;
            }
            console.log(`[INFO] Se han encontrado ${recordsToProcess.length} sorteos nuevos.`);

            const omegaData = JSON.parse(fs.readFileSync(OMEGA_DATA_PATH, 'utf-8'));
            freqPares = new Map(Object.entries(omegaData.FREQ_PARES));
            freqTercias = new Map(Object.entries(omegaData.FREQ_TERCIAS));
            freqCuartetos = new Map(Object.entries(omegaData.FREQ_CUARTETOS));

            recordsToProcess.forEach(record => {
                const combination = [record.r1, record.r2, record.r3, record.r4, record.r5, record.r6];
                getCombinations(combination, 2).forEach(sub => { const key = `(${sub.sort((a,b)=>a-b).join(',')})`; freqPares.set(key, (freqPares.get(key) || 0) + 1); });
                getCombinations(combination, 3).forEach(sub => { const key = `(${sub.sort((a,b)=>a-b).join(',')})`; freqTercias.set(key, (freqTercias.get(key) || 0) + 1); });
                getCombinations(combination, 4).forEach(sub => { const key = `(${sub.sort((a,b)=>a-b).join(',')})`; freqCuartetos.set(key, (freqCuartetos.get(key) || 0) + 1); });
            });
        } else {
            freqPares = createFrequencyMap(recordsToProcess, 2);
            freqTercias = createFrequencyMap(recordsToProcess, 3);
            freqCuartetos = createFrequencyMap(recordsToProcess, 4);
        }

        console.log('[PASO 2/5] Exportando mapas de frecuencia a JSON...');
        fs.writeFileSync(OMEGA_DATA_PATH, JSON.stringify({
            FREQ_PARES: Object.fromEntries(freqPares),
            FREQ_TERCIAS: Object.fromEntries(freqTercias),
            FREQ_CUARTETOS: Object.fromEntries(freqCuartetos)
        }, null, 2));
        console.log('[ÉXITO] Archivo omega-data.json actualizado.');
        
        console.log(`[PASO 3/5] Calculando datos analíticos...`);
        const analyzedRecords = recordsToProcess.map(record => {
            const combination = [record.r1, record.r2, record.r3, record.r4, record.r5, record.r6];
            const afinidad_pares = calculateAffinity(combination, freqPares, 2);
            const afinidad_tercias = calculateAffinity(combination, freqTercias, 3);
            const afinidad_cuartetos = calculateAffinity(combination, freqCuartetos, 4);
            const clase_omega = afinidad_pares >= UMBRAL_PARES && afinidad_tercias >= UMBRAL_TERCIAS && afinidad_cuartetos >= UMBRAL_CUARTETOS;
            const omega_score = (afinidad_pares / UMBRAL_PARES + afinidad_tercias / UMBRAL_TERCIAS + afinidad_cuartetos / UMBRAL_CUARTETOS) / 3;
            return { ...record, clase_omega, omega_score, afinidad_cuartetos, afinidad_tercias, afinidad_pares };
        });
        console.log('[ÉXITO] Cálculos completados.');

        console.log('[PASO 4/5] Guardando registros en la base de datos...');
        await new Promise((resolve, reject) => {
            db.serialize(() => {
                if (isRebuild) {
                    db.run(`CREATE TABLE IF NOT EXISTS ${TABLE_NAME} (
                        concurso INTEGER PRIMARY KEY, fecha TEXT, r1 INTEGER, r2 INTEGER, r3 INTEGER, r4 INTEGER, r5 INTEGER, r6 INTEGER,
                        bolsa_acumulada TEXT, clase_omega BOOLEAN, omega_score REAL,
                        afinidad_cuartetos INTEGER, afinidad_tercias INTEGER, afinidad_pares INTEGER
                    )`);
                }
                
                db.run('BEGIN TRANSACTION');
                const stmt = db.prepare(`INSERT OR IGNORE INTO ${TABLE_NAME} 
                    (concurso, fecha, r1, r2, r3, r4, r5, r6, bolsa_acumulada, clase_omega, omega_score, afinidad_cuartetos, afinidad_tercias, afinidad_pares) 
                    VALUES ($concurso, $fecha, $r1, $r2, $r3, $r4, $r5, $r6, $bolsa_acumulada, $clase_omega, $omega_score, $afinidad_cuartetos, $afinidad_tercias, $afinidad_pares)`);
                
                analyzedRecords.forEach(rec => {
                    const params = {};
                    for(const key in rec) {
                        params[`$${key}`] = rec[key];
                    }
                    stmt.run(params);
                });

                stmt.finalize(err => { if(err) reject(err); });
                db.run('COMMIT', err => { if(err) reject(err); });
                
                console.log('[ÉXITO] Base de datos actualizada.');
                
                console.log('[PASO 5/5] Generando archivo JSON final...');
                db.all(`SELECT * FROM ${TABLE_NAME} ORDER BY concurso DESC`, (err, rows) => {
                    if (err) return reject(err);
                    fs.writeFileSync(JSON_OUTPUT_PATH, JSON.stringify({ historicos: rows }, null, 2));
                    console.log(`[ÉXITO] Archivo JSON generado con ${rows.length} registros.`);
                    db.close(err => { if(err) reject(err); else resolve(); });
                });
            });
        });
        
    } catch (error) {
        console.error('\n--- !!! ERROR DURANTE EL PROCESO !!! ---');
        console.error(error.stack);
        db.close();
        process.exit(1);
    }
}

main();
