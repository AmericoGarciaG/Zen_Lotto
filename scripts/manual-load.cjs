// scripts/manual-load.cjs
console.log('--- Iniciando Carga y Actualización de Datos ---');

// Deshabilita la validación de certificados SSL para el servidor de Pronósticos.
process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";

const axios = require('axios');
const sqlite3 = require('sqlite3').verbose();
const { parse } = require('csv-parse/sync');
const path = require('path');
const fs = require('fs');

// --- CONFIGURACIÓN ---
const DB_PATH = path.resolve(__dirname, '../lottodata.db');
const JSON_OUTPUT_PATH = path.resolve(__dirname, '../public/db.json');
const MELATE_RETRO_URL = 'https://www.loterianacional.gob.mx/Home/Historicos?ARHP=TQBlAGwAYQB0AGUALQBSAGUAdAByAG8A';
const TABLE_NAME = 'historicos';

// --- FUNCIONES ---

// Formatea la fecha de DD/MM/YYYY a YYYY-MM-DD
function formatDate(dateStr) {
    if (!dateStr || typeof dateStr !== 'string') return null;
    const parts = dateStr.split('/');
    if (parts.length !== 3) return null;
    const [day, month, year] = parts;
    const fullYear = year.length === 2 ? `20${year}` : year;
    return `${fullYear}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
}

// Función principal asíncrona
async function run() {
    try {
        // --- 1. Descargar CSV ---
        console.log(`[PASO 1/4] Descargando CSV desde la URL correcta...`);
        const response = await axios.get(MELATE_RETRO_URL, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
            }
        });
        const csvData = response.data;
        console.log('[ÉXITO] CSV descargado.');

        // --- 2. Parsear CSV ---
        console.log('[PASO 2/4] Parseando datos del CSV...');
        const records = parse(csvData, {
            columns: true,
            skip_empty_lines: true,
            trim: true,
            relax_column_count: true,
        });
        console.log(`[ÉXITO] ${records.length} registros parseados del CSV.`);

        // --- 3. Cargar a la Base de Datos ---
        console.log(`[PASO 3/4] Conectando y actualizando la base de datos en ${DB_PATH}...`);
        const db = new sqlite3.Database(DB_PATH);

        const changes = await new Promise((resolve, reject) => {
            let initialCount = 0;
            let finalCount = 0;

            db.serialize(() => {
                db.run(`
                    CREATE TABLE IF NOT EXISTS ${TABLE_NAME} (
                        concurso INTEGER PRIMARY KEY, fecha TEXT,
                        r1 INTEGER, r2 INTEGER, r3 INTEGER, r4 INTEGER, r5 INTEGER, r6 INTEGER,
                        bolsa_acumulada TEXT
                    )
                `, (err) => { if (err) return reject(err); });

                db.get(`SELECT COUNT(*) as count FROM ${TABLE_NAME}`, (err, row) => {
                    if (err) return reject(err);
                    initialCount = row.count;
                });
                
                db.run('BEGIN TRANSACTION', (err) => { if (err) return reject(err); });

                const stmt = db.prepare(`INSERT OR IGNORE INTO ${TABLE_NAME} (concurso, fecha, r1, r2, r3, r4, r5, r6, bolsa_acumulada) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`);
                
                for (const record of records) {
                    const concurso = record['CONCURSO'];
                    const fecha = record['FECHA'];
                    
                    if (concurso && fecha) {
                        stmt.run(
                            parseInt(concurso), formatDate(fecha),
                            parseInt(record.R1), parseInt(record.R2), parseInt(record.R3),
                            parseInt(record.R4), parseInt(record.R5), parseInt(record.R6),
                            record['BOLSA']
                        );
                    }
                }
                
                stmt.finalize((err) => { if (err) return reject(err); });
                db.run('COMMIT', (err) => {
                    if (err) return reject(err);
                    
                    db.get(`SELECT COUNT(*) as count FROM ${TABLE_NAME}`, (err, row) => {
                        if (err) return reject(err);
                        finalCount = row.count;
                        console.log(`[ÉXITO] Base de datos actualizada. Se añadieron ${finalCount - initialCount} nuevos registros.`);
                        resolve(finalCount - initialCount);
                    });
                });
            });
        });
        
        // --- 4. Generar JSON Final ---
        console.log(`[PASO 4/4] Generando archivo JSON final en ${JSON_OUTPUT_PATH}...`);
        const rows = await new Promise((resolve, reject) => {
            db.all(`SELECT * FROM ${TABLE_NAME} ORDER BY concurso DESC`, [], (err, rows) => {
                if (err) return reject(err);
                resolve(rows);
            });
        });

        fs.writeFileSync(JSON_OUTPUT_PATH, JSON.stringify({ historicos: rows }, null, 2));
        console.log(`[ÉXITO] Archivo JSON generado con ${rows.length} registros.`);

        db.close();
        console.log(`
--- Proceso de Actualización Completado Exitosamente (Nuevos registros: ${changes}) ---`);

    } catch (error) {
        console.error('\n--- !!! ERROR DURANTE LA ACTUALIZACIÓN !!! ---');
        console.error(error.stack);
        console.error('---------------------------------------------');
        process.exit(1);
    }
}

run();
