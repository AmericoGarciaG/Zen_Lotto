const fs = require('fs');
const path = require('path');
const axios = require('axios');
const config = require('./config.json');

const downloadCSV = async () => {
  const url = config.urls.melate_retro;
  if (!url) {
    console.error('Error: La URL de descarga no está definida en config.json');
    process.exit(1);
  }

  const filePath = path.join(__dirname, 'melate_retro_download.csv');

  try {
    console.log(`Descargando CSV desde: ${url}`);
    const response = await axios.get(url, {
      responseType: 'stream',
    });

    // Validar si la respuesta es HTML (lo que indicaría un error en la página de origen)
    const contentType = response.headers['content-type'];
    if (contentType && contentType.includes('html')) {
        console.error('Error: La URL de descarga no apunta a un archivo CSV válido, sino a una página HTML.');
        console.error('Esto puede suceder si la sesión ha expirado o la URL ha cambiado.');
        process.exit(1);
    }

    const writer = fs.createWriteStream(filePath);
    response.data.pipe(writer);

    return new Promise((resolve, reject) => {
      writer.on('finish', () => {
        console.log(`Archivo CSV guardado correctamente en: ${filePath}`);
        resolve();
      });
      writer.on('error', (err) => {
        console.error('Error al escribir el archivo CSV:', err);
        reject(err);
      });
    });
  } catch (error) {
    console.error('Error al descargar el archivo CSV:', error.message);
    process.exit(1);
  }
};

downloadCSV();
