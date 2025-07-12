// server.cjs
const express = require('express');
const cors = require('cors');
const axios = require('axios');
const sqlite3 = require('sqlite3');
const { parse } = require('csv-parse/sync');
const fs = require('fs');
const path = require('path');

const app = express();
const port = 3001;

const JSON_OUTPUT_PATH = path.resolve(__dirname, './public/db.json');
const MELATE_RETRO_URL = 'http://www.pronosticos.gob.mx/Documentos/Historicos/MelateRetro.csv';

app.use(cors());

// --- UTILITY FUNCTIONS ---
const sendEvent = (res, type, message) => {
    const logMessage = `[${type.toUpperCase()}] ${message}`;
    console.log(logMessage);
    res.write(`data: ${logMessage}

`);
};

const formatDate = (dateStr) => {
    if (!dateStr || typeof dateStr !== 'string') return null;
    const parts = dateStr.split('/');
    if (parts.length !== 3) return null;
    const [day, month, year] = parts;
    return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
};

// --- CORE LOGIC ---
const downloadCsv = async (res) => {
    sendEvent(res, 'info', 'Paso 1/4: Iniciando descarga del archivo CSV...');
    try {
        const response = await axios.get(MELATE_RETRO_URL, { responseType: 'arraybuffer' });
        // Check for HTML response, which indicates an error on the source page
        const contentType = response.headers['content-type'];
        if (contentType && contentType.includes('html')) {
            throw new Error('La URL de origen devolvió una página HTML en lugar de un CSV. La URL puede estar desactualizada.');
        }
        sendEvent(res, 'success', 'Paso 1/4: Descarga del CSV completada.');
        return response.data.toString('utf-8');
    } catch (error) {
        throw new Error(`Fallo en la descarga del CSV: ${error.message}`);
    }
};

const processDataToDb = (res, csvData) => {
    sendEvent(res, 'info', 'Paso 2/4: Procesando datos y cargando en base de datos en memoria...');
    return new Promise((resolve, reject) => {
        // Use an in-memory database
        const db = new sqlite3.Database(':memory:', (err) => {
            if (err) return reject(new Error(`Error al crear la base de datos en memoria: ${err.message}`));
        });

        const records = parse(csvData, {
            columns: true,
            skip_empty_lines: true,
            trim: true,
            relax_column_count: true,
        });

        db.serialize(() => {
            db.run(`
                CREATE TABLE historicos (
                    concurso INTEGER PRIMARY KEY, fecha TEXT,
                    r1 INTEGER, r2 INTEGER, r3 INTEGER, r4 INTEGER, r5 INTEGER, r6 INTEGER,
                    bolsa_acumulada TEXT
                )
            `);

            db.run('BEGIN TRANSACTION');
            const stmt = db.prepare('INSERT INTO historicos VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)');
            
            let count = 0;
            for (const record of records) {
                const concurso = record['CONCURSO'] || record['concurso'];
                const fecha = record['FECHA'] || record['fecha'];
                
                if (concurso && fecha) {
                    stmt.run(
                        parseInt(concurso),
                        formatDate(fecha),
                        parseInt(record.R1), parseInt(record.R2), parseInt(record.R3),
                        parseInt(record.R4), parseInt(record.R5), parseInt(record.R6),
                        record['BOLSA ACUMULADA'] || record['bolsa acumulada']
                    );
                    count++;
                }
            }
            
            stmt.finalize();
            db.run('COMMIT');
            sendEvent(res, 'success', `Paso 2/4: ${count} registros procesados en memoria.`);
            resolve(db);
        });
    });
};

const generateJsonFromDb = (res, db) => {
    sendEvent(res, 'info', 'Paso 3/4: Generando archivo JSON desde los datos en memoria...');
    return new Promise((resolve, reject) => {
        db.all('SELECT * FROM historicos ORDER BY concurso DESC', [], (err, rows) => {
            if (err) return reject(new Error(`Error al consultar la base de datos en memoria: ${err.message}`));
            
            const data = { historicos: rows };
            fs.writeFile(JSON_OUTPUT_PATH, JSON.stringify(data, null, 2), (err) => {
                if (err) return reject(new Error(`Error al escribir el archivo db.json: ${err.message}`));
                sendEvent(res, 'success', `Paso 3/4: Archivo JSON generado con ${rows.length} registros.`);
                resolve();
            });
        });
    });
};


// --- ENDPOINTS ---
app.get('/status', (req, res) => {
    res.status(200).json({ status: 'ok', message: 'Servidor funcionando y listo.' });
});

app.get('/generate-history', async (req, res) => {
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');

    let db;
    try {
        const csvData = await downloadCsv(res);
        db = await processDataToDb(res, csvData);
        await generateJsonFromDb(res, db);
        
        sendEvent(res, 'success', 'Paso 4/4: ¡Proceso completado con éxito!');

    } catch (error) {
        sendEvent(res, 'error', `FALLO EL PROCESO. Razón: ${error.message}`);
    } finally {
        if (db) db.close();
        res.write('data: CLOSE_CONNECTION\n');
        res.end();
    }
});

app.listen(port, () => {
    console.log(`Servidor rediseñado escuchando en http://localhost:${port}`);
});
