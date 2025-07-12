// scripts/clear-db.cjs
console.log('--- Iniciando Limpieza de la Base de Datos ---');

const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const fs = require('fs');

// --- CONFIGURACIÓN ---
const DB_PATH = path.resolve(__dirname, '../lottodata.db');
const JSON_OUTPUT_PATH = path.resolve(__dirname, '../public/db.json');
const TABLE_NAME = 'historicos';

// --- LÓGICA ---
if (!fs.existsSync(DB_PATH)) {
    console.log('[INFO] No existe la base de datos. No hay nada que limpiar.');
    process.exit(0);
}

const db = new sqlite3.Database(DB_PATH, (err) => {
    if (err) {
        console.error(`[ERROR] No se pudo conectar a la base de datos en ${DB_PATH}:`, err.message);
        process.exit(1);
    }
});

console.log(`[PASO 1/2] Conectado a la base de datos. Vaciando la tabla '${TABLE_NAME}'...`);

db.run(`DELETE FROM ${TABLE_NAME}`, function(err) {
    if (err) {
        console.error(`[ERROR] No se pudo vaciar la tabla '${TABLE_NAME}':`, err.message);
        db.close();
        process.exit(1);
    }
    
    // this.changes contiene el número de filas afectadas
    console.log(`[ÉXITO] Tabla '${TABLE_NAME}' vaciada. Se eliminaron ${this.changes} registros.`);
    
    // También actualizamos el archivo JSON para que refleje la base de datos vacía
    console.log(`[PASO 2/2] Actualizando el archivo JSON en ${JSON_OUTPUT_PATH} para que esté vacío...`);
    fs.writeFileSync(JSON_OUTPUT_PATH, JSON.stringify({ historicos: [] }, null, 2));
    console.log('[ÉXITO] Archivo JSON actualizado.');

    db.close((err) => {
        if (err) {
            console.error('[ERROR] No se pudo cerrar la conexión con la base de datos:', err.message);
        }
        console.log('\n--- Proceso de Limpieza Completado Exitosamente ---');
    });
});
