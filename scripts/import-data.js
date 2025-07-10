// scripts/import-data.js
const sqlite3 = require('sqlite3').verbose();
const fs = require('fs');
const path = require('path');
const axios = require('axios');
const https = require('https');
const { parse } = require('csv-parse/sync');
const config = require('./config.json');
const { FREQ_PARES, FREQ_TERCIAS, FREQ_CUARTETOS } = require('./omega-data.js');

// Constants from config
const MELATE_RETRO_URL = config.urls.melate_retro;
const DB_PATH = path.resolve(__dirname, '../lottodata.db');
const CSV_DOWNLOAD_PATH = path.resolve(__dirname, 'melate_retro_download.csv');

// Omega criteria from config
const { umbral_pares, umbral_tercias, umbral_cuartetos } = config.omega_criteria;

// Create a new https agent with rejectUnauthorized set to false
const httpsAgent = new https.Agent({
  rejectUnauthorized: false,
});

// Helper functions (remain the same)
function calcularAfinidadPares(combinacion) {
    let afinidad = 0;
    for (let i = 0; i < combinacion.length; i++) {
        for (let j = i + 1; j < combinacion.length; j++) {
            const par = `(${Math.min(combinacion[i], combinacion[j])},${Math.max(combinacion[i], combinacion[j])})`;
            afinidad += FREQ_PARES[par] || 0;
        }
    }
    return afinidad;
}

function calcularAfinidadTercias(combinacion) {
    let afinidad = 0;
    const sortedCombination = [...combinacion].sort((a, b) => a - b);
    for (let i = 0; i < sortedCombination.length; i++) {
        for (let j = i + 1; j < sortedCombination.length; j++) {
            for (let k = j + 1; k < sortedCombination.length; k++) {
                const tercia = `(${sortedCombination[i]},${sortedCombination[j]},${sortedCombination[k]})`;
                afinidad += FREQ_TERCIAS[tercia] || 0;
            }
        }
    }
    return afinidad;
}

function calcularAfinidadCuartetos(combinacion) {
    let afinidad = 0;
    const sortedCombination = [...combinacion].sort((a, b) => a - b);
    for (let i = 0; i < sortedCombination.length; i++) {
        for (let j = i + 1; j < sortedCombination.length; j++) {
            for (let k = j + 1; k < sortedCombination.length; k++) {
                for (let l = k + 1; l < sortedCombination.length; l++) {
                    const cuarteto = `(${sortedCombination[i]},${sortedCombination[j]},${sortedCombination[k]},${sortedCombination[l]})`;
                    afinidad += FREQ_CUARTETOS[cuarteto] || 0;
                }
            }
        }
    }
    return afinidad;
}

function esClaseOmega(combinacion) {
    const afinidadPares = calcularAfinidadPares(combinacion);
    if (afinidadPares < umbral_pares) return 0;

    const afinidadTercias = calcularAfinidadTercias(combinacion);
    if (afinidadTercias < umbral_tercias) return 0;

    const afinidadCuartetos = calcularAfinidadCuartetos(combinacion);
    return afinidadCuartetos >= umbral_cuartetos ? 1 : 0;
}

async function downloadCSV(url, outputPath) {
    try {
        const response = await axios.get(url, { responseType: 'arraybuffer', httpsAgent });
        fs.writeFileSync(outputPath, response.data);
    } catch (error) {
        console.error('Error downloading the CSV file:', error);
        throw error;
    }
}

function formatDate(dateStr) {
  if (!dateStr) return null;
  const parts = dateStr.split('/');
  if (parts.length !== 3) return dateStr;
  const [day, month, year] = parts;
  return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
}

async function main() {
    await downloadCSV(MELATE_RETRO_URL, CSV_DOWNLOAD_PATH);
    console.log('Download complete.');

    const db = new sqlite3.Database(DB_PATH);

    db.serialize(() => {
        db.run('DROP TABLE IF EXISTS melate_retro');
        db.run(`
            CREATE TABLE melate_retro (
                id INTEGER PRIMARY KEY,
                concurso INTEGER UNIQUE,
                fecha TEXT,
                r1 INTEGER, r2 INTEGER, r3 INTEGER, r4 INTEGER, r5 INTEGER, r6 INTEGER,
                bolsa_acumulada TEXT,
                clase_omega INTEGER
            )
        `);
        
        const fileContent = fs.readFileSync(CSV_DOWNLOAD_PATH, 'latin1');
        const records = parse(fileContent, {
            columns: true,
            skip_empty_lines: true
        });
        
        const stmt = db.prepare(`
            INSERT OR IGNORE INTO melate_retro (
                concurso, fecha, r1, r2, r3, r4, r5, r6, bolsa_acumulada, clase_omega
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `);

        records.forEach(record => {
            const combination = [
                parseInt(record.F1, 10),
                parseInt(record.F2, 10),
                parseInt(record.F3, 10),
                parseInt(record.F4, 10),
                parseInt(record.F5, 10),
                parseInt(record.F6, 10)
            ].filter(n => !isNaN(n));

            if (combination.length === 6) {
                const claseOmega = esClaseOmega(combination);
                stmt.run(
                    record.CONCURSO, formatDate(record.FECHA),
                    record.F1, record.F2, record.F3, record.F4, record.F5, record.F6,
                    record.BOLSA,
                    claseOmega
                );
            }
        });

        stmt.finalize((err) => {
            if (err) {
                console.error('Error finalizing statement:', err.message);
            }
            db.close((err) => {
                if (err) {
                    return console.error(err.message);
                }
                console.log('Data import and analysis complete. Database closed.');
            });
        });
    });
}

main().catch(error => {
    console.error('An error occurred during the import process:', error);
});
