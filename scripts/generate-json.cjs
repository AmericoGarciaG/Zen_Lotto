// scripts/generate-json.js
const sqlite3 = require('sqlite3').verbose();
const fs = require('fs');
const path = require('path');

const DB_PATH = path.resolve(__dirname, '../lottodata.db');
const JSON_OUTPUT_PATH = path.resolve(__dirname, '../src/api/db.json');

const db = new sqlite3.Database(DB_PATH, (err) => {
    if (err) {
        console.error('Error connecting to the database:', err.message);
        return;
    }
    console.log('Connected to the lottodata.db database.');
});

db.serialize(() => {
    const query = 'SELECT * FROM melate_retro ORDER BY concurso DESC';
    db.all(query, [], (err, rows) => {
        if (err) {
            console.error('Error querying the database:', err.message);
            return;
        }

        const data = {
            melate_retro: rows
        };

        fs.writeFile(JSON_OUTPUT_PATH, JSON.stringify(data, null, 2), (err) => {
            if (err) {
                console.error('Error writing JSON file:', err.message);
                return;
            }
            console.log(`Successfully generated db.json at ${JSON_OUTPUT_PATH}`);
        });
    });
});

db.close((err) => {
    if (err) {
        return console.error(err.message);
    }
    console.log('Database connection closed.');
});
