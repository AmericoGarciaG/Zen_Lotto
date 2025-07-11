const express = require('express');
const { spawn } = require('child_process');
const cors = require('cors');

const app = express();
const port = 3001;

app.use(cors());

// --- runScript con manejo de errores mejorado ---
const runScript = (scriptPath, res) => {
  return new Promise((resolve, reject) => {
    const script = spawn('node', [scriptPath]);
    let stderrOutput = ''; // Acumulador para la salida de error

    script.stdout.on('data', (data) => {
      const message = data.toString();
      console.log(`stdout: ${message}`);
      res.write(`data: ${message}

`);
    });

    script.stderr.on('data', (data) => {
      const errorMessage = data.toString();
      console.error(`stderr: ${errorMessage}`);
      stderrOutput += errorMessage; // Acumula los mensajes de error
      res.write(`data: ERROR: ${errorMessage}

`);
    });

    script.on('close', (code) => {
      if (code === 0) {
        resolve();
      } else {
        // Rechaza la promesa con el error acumulado
        reject(new Error(`El script ${path.basename(scriptPath)} finalizó con código ${code}. Detalles: ${stderrOutput}`));
      }
    });

    script.on('error', (err) => {
      // Maneja errores al intentar ejecutar el script
      reject(err);
    });
  });
};

app.get('/generate-history', async (req, res) => {
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');

  try {
    // Los mensajes ahora son más claros y específicos
    res.write('data: Paso 1/3: Iniciando la descarga del archivo CSV... 

');
    await runScript('./scripts/download-csv.cjs', res);
    
    res.write('data: Paso 2/3: Procesando CSV e importando a la base de datos... 

');
    await runScript('./scripts/import-data.cjs', res);
    
    res.write('data: Paso 3/3: Generando el archivo JSON final desde la base de datos... 

');
    await runScript('./scripts/generate-json.cjs', res);

    res.write('data: ¡Proceso completado con éxito! El histórico de datos ha sido actualizado.

');
  } catch (error) {
    console.error('Error durante la ejecución del proceso:', error.message);
    // Envía el mensaje de error detallado al cliente
    res.write(`data: FALLO EL PROCESO. Razón: ${error.message}

`);
  } finally {
    // Cierra la conexión enviando un evento especial
    res.write('data: CLOSE_CONNECTION

');
    res.end();
  }
});

app.listen(port, () => {
  console.log(`Servidor escuchando en http://localhost:${port}`);
});
