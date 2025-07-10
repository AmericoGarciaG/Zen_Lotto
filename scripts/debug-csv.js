// scripts/debug-csv.js
const axios = require('axios');
const https = require('https');
const { parse } = require('csv-parse/sync');
const config = require('./config.json');

const MELATE_RETRO_URL = config.urls.melate_retro;
const CSV_DOWNLOAD_PATH = require('path').resolve(__dirname, 'melate_retro_download.csv');
const fs = require('fs');

const httpsAgent = new https.Agent({
  rejectUnauthorized: false,
});

async function downloadCSV(url, outputPath) {
    try {
        const response = await axios.get(url, { responseType: 'stream', httpsAgent });
        const writer = fs.createWriteStream(outputPath);
        response.data.pipe(writer);

        return new Promise((resolve, reject) => {
            writer.on('finish', resolve);
            writer.on('error', reject);
        });
    } catch (error) {
        console.error('Error downloading the CSV file:', error);
        throw error;
    }
}

async function debugCSV() {
    console.log('Downloading CSV for debugging...');
    await downloadCSV(MELATE_RETRO_URL, CSV_DOWNLOAD_PATH);
    console.log('Download complete.');

    const fileContent = fs.readFileSync(CSV_DOWNLOAD_PATH, 'latin1');
    const records = parse(fileContent, {
        columns: true,
        skip_empty_lines: true,
        to: 5 // Limit to the first 5 records
    });

    console.log('--- CSV Headers ---');
    if (records.length > 0) {
        console.log(Object.keys(records[0]));
    }
    console.log('--- First 5 Records ---');
    console.log(records);
}

debugCSV().catch(console.error);
