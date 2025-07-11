import React, { useState } from 'react';
import './Settings.css';

const Settings: React.FC = () => {
  const [logs, setLogs] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const handleGenerateHistory = async () => {
    setIsLoading(true);
    setLogs([]); // Clear previous logs
    const eventSource = new EventSource('http://localhost:3001/generate-history');

    eventSource.onmessage = (event) => {
      const data = event.data;
      // Use includes to catch the final message
      if (data.includes('¡Proceso completado con éxito!')) {
        setLogs(prevLogs => [...prevLogs, data]);
        eventSource.close();
        setIsLoading(false);
      } else {
        setLogs(prevLogs => [...prevLogs, data]);
      }
    };

    eventSource.onerror = (err) => {
      // Improved error logging
      console.error('EventSource failed:', JSON.stringify(err, null, 2));
      setLogs(prevLogs => [...prevLogs, 'Error de conexión con el servidor. ¿Olvidaste ejecutar "npm run server" en otra terminal?']);
      eventSource.close();
      setIsLoading(false);
    };
  };

  const handleGenerateOmegaClass = () => {
    // Lógica pospuesta para una futura implementación.
    console.log('Generando clase omega (lógica no implementada)...');
    alert('Esta función se implementará en el futuro.');
  };

  return (
    <div>
      <h2>Configuración</h2>
      <p>Aquí irán las opciones de configuración.</p>
      <div className="settings-buttons">
        <button onClick={handleGenerateHistory} disabled={isLoading}>
          {isLoading ? 'Generando...' : 'Generar Histórico'}
        </button>
        <button onClick={handleGenerateOmegaClass}>Generar Clase Omega</button>
      </div>
      {/* Display logs only when there's something to show */}
      {(isLoading || logs.length > 0) && (
        <div className="logs-container">
          <h3>Progreso:</h3>
          <pre>
            {/* Corrected join character */}
            {logs.join(' ')}
          </pre>
        </div>
      )}
    </div>
  );
};

export default Settings;
