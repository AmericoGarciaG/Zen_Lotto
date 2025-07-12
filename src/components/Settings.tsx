import React, { useState, useEffect, useRef } from 'react';
import './Settings.css';

// Define a type for our log entries for better structure
type LogEntry = {
  type: 'info' | 'error' | 'success';
  message: string;
};

const Settings: React.FC = () => {
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const logsEndRef = useRef<HTMLDivElement>(null); // Ref for autoscrolling

  // Effect to scroll to the bottom of the logs
  useEffect(() => {
    logsEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [logs]);

  const handleGenerateHistory = async () => {
    setIsLoading(true);
    setLogs([{ type: 'info', message: 'Iniciando conexión con el servidor...' }]);
    
    const eventSource = new EventSource('http://localhost:3001/generate-history');

    eventSource.onopen = () => {
      setLogs(prev => [...prev, { type: 'success', message: 'Conexión establecida. Iniciando proceso...' }]);
    };

    eventSource.onmessage = (event) => {
      const data = event.data;

      if (data === 'CLOSE_CONNECTION') {
        // Use a success message for a clean finish
        if (!logs.some(log => log.type === 'error')) {
            setLogs(prev => [...prev, { type: 'success', message: 'Proceso finalizado con éxito.' }]);
        }
        eventSource.close();
        setIsLoading(false);
        return;
      }
      
      let logType: LogEntry['type'] = 'info';
      let message = data;

      if (data.startsWith('ERROR:') || data.startsWith('FALLO')) {
        logType = 'error';
        message = data.replace(/^(ERROR:|FALLO EL PROCESO\.)\s*/, '');
      } else if (data.includes('¡Proceso completado con éxito!')) {
        logType = 'success';
      }

      setLogs(prev => [...prev, { type: logType, message: message.trim() }]);
    };

    eventSource.onerror = () => {
      // This is now the definitive "something went wrong" handler
      setLogs(prev => [...prev, { 
        type: 'error', 
        message: 'La conexión con el servidor se cortó inesperadamente. Revisa la consola de la terminal del servidor (no la del navegador) para ver los errores fatales.' 
      }]);
      eventSource.close();
      setIsLoading(false);
    };
  };

  const handleGenerateOmegaClass = () => {
    alert('Esta función se implementará en el futuro.');
  };

  return (
    <div>
      <h2>Configuración</h2>
      <p>Opciones para la gestión de la base de datos de sorteos.</p>
      <div className="settings-buttons">
        <button onClick={handleGenerateHistory} disabled={isLoading}>
          {isLoading ? 'Generando...' : 'Generar Histórico'}
        </button>
        <button onClick={handleGenerateOmegaClass}>Generar Clase Omega</button>
      </div>
      
      {(isLoading || logs.length > 0) && (
        <div className="logs-container">
          <h3>Progreso:</h3>
          <div className="logs-box">
            {logs.map((log, index) => (
              <p key={index} className={`log-entry log-${log.type}`}>
                {log.message}
              </p>
            ))}
            {/* Invisible element to scroll to */}
            <div ref={logsEndRef} />
          </div>
        </div>
      )}
    </div>
  );
};

export default Settings;
