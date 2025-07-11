// scripts/import-data.cjs
const sqlite3 = require('sqlite3').verbose();
const fs = require('fs');
const path = require('path');
const { parse } = require('csv-parse/sync');

// Constantes
const DB_PATH = path.resolve(__dirname, '../lottodata.db');
const CSV_PATH = path.resolve(__dirname, 'melate_retro_download.csv');

// Función para formatear la fecha de DD/MM/YYYY a YYYY-MM-DD
function formatDate(dateStr) {
  if (!dateStr || typeof dateStr !== 'string') return null;
  const parts = dateStr.split('/');
  if (parts.length !== 3) return null; // Formato no esperado
  const [day, month, year] = parts;
  const fullYear = year.length === 2 ? `20${year}` : year;
  return `${fullYear}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
}

// Función principal
function importData() {
    if (!fs.existsSync(CSV_PATH)) {
        console.error(`Error: El archivo ${CSV_PATH} no existe. Ejecuta primero la descarga.`);
        process.exit(1);
    }

    const db = new sqlite3.Database(DB_PATH, (err) => {
        if (err) {
            console.error('Error al abrir la base de datos:', err.message);
            process.exit(1);
        }
        console.log('Conectado a la base de datos SQLite.');
    });

    db.serialize(() => {
        db.run(`
            CREATE TABLE IF NOT EXISTS historicos (
                concurso INTEGER PRIMARY KEY,
                fecha TEXT,
                r1 INTEGER, r2 INTEGER, r3 INTEGER, r4 INTEGER, r5 INTEGER, r6 INTEGER,
                bolsa_acumulada TEXT,
                clase_omega TEXT DEFAULT 'No',
                omega_score REAL DEFAULT 0,
                afinidad_cuartetos INTEGER DEFAULT 0,
                afinidad_tercias INTEGER DEFAULT 0,
                afinidad_pares INTEGER DEFAULT 0
            )
        `);

        db.run('DELETE FROM historicos', (err) => {
            if (err) {
                console.error('Error al limpiar la tabla historicos:', err.message);
                return;
            }
            console.log('Tabla "historicos" limpiada.');
        });
        
        // --- Lógica de limpieza y parseo mejorada ---
        const fileContent = fs.readFileSync(CSV_PATH, 'utf-8');
        const lines = fileContent.split('\n');
        
        // Expresión regular para validar una línea de datos de sorteo
        const validLineRegex = /^\s*\d+,\s*\d+,\s*\d+,\s*\d+,\s*\d+,\s*\d+,\s*\d+,\s*\d+,\s*\d*,\s*\d+,\s*\d{2}\/\d{2}\/\d{4}\s*$/;
        
        const cleanLines = lines.filter(line => validLineRegex.test(line.trim()));
        
        if (cleanLines.length === 0) {
            console.error("Error: No se encontraron líneas de datos válidas en el archivo CSV.");
            db.close();
            process.exit(1);
        }

        const cleanCsvContent = cleanLines.join('\n');


        const records = parse(cleanCsvContent, {
            columns: ['producto', 'concurso', 'r1', 'r2', 'r3', 'r4', 'r5', 'r6', 'adicional', 'bolsa', 'fecha'],
            skip_empty_lines: true,
            trim: true,
        });
        
        const stmt = db.prepare(`
            INSERT INTO historicos (
                concurso, fecha, r1, r2, r3, r4, r5, r6, bolsa_acumulada
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        `);

        records.forEach(record => {
            const fechaFormateada = formatDate(record.fecha);
            if (!fechaFormateada || !record.concurso) {
                console.warn('Omitiendo registro inválido:', record);
                return;
            }

            stmt.run(
                parseInt(record.concurso, 10), fechaFormateada,
                parseInt(record.r1, 10), parseInt(record.r2, 10), parseInt(record.r3, 10),
                parseInt(record.r4, 10), parseInt(record.r5, 10), parseInt(record.r6, 10),
                record.bolsa
            );
        });

        stmt.finalize((err) => {
            if (err) {
                console.error('Error al finalizar la inserción:', err.message);
            } else {
                console.log(`Importación completada: Se procesaron ${records.length} registros válidos.`);
            }
            
            db.close((err) => {
                if (err) {
                    console.error('Error al cerrar la base de datos:', err.message);
                } else {
                    console.log('Conexión con la base de datos cerrada.');
                }
            });
        });
    });
}

// Ejecutar la función
importData();
