import React from 'react';
import './DistributionCharts.css';

const DistributionCharts: React.FC = () => {
    // Datos fijos
    const totalSorteosHistoricos = 1500;
    const porcentajeOmegaHistorico = 61.77;
    
    const combinacionesOmegaHistoricas = Math.round(totalSorteosHistoricos * (porcentajeOmegaHistorico / 100));
    const combinacionesNoOmegaHistoricas = totalSorteosHistoricos - combinacionesOmegaHistoricas;
    const porcentajeNoOmegaHistorico = 100 - porcentajeOmegaHistorico;

    const totalCombinacionesPosibles = 3262623; // C(39, 6)
    const porcentajeOmegaTotal = 2.4128;
    
    const combinacionesOmegaTotales = Math.round(totalCombinacionesPosibles * (porcentajeOmegaTotal / 100));
    const combinacionesNoOmegaTotales = totalCombinacionesPosibles - combinacionesOmegaTotales;
    const porcentajeNoOmegaTotal = 100 - porcentajeOmegaTotal;

    return (
        <div className="charts-wrapper">
            <h3>Distribución de Clases Omega</h3>
            
            <div className="chart-container">
                <h4>Basado en Sorteos Históricos (últimos {totalSorteosHistoricos})</h4>
                <div className="chart-bar">
                    <div 
                        className="bar-segment omega" 
                        style={{ width: `${porcentajeOmegaHistorico}%` }}
                        title={`Clase Omega: ${combinacionesOmegaHistoricas.toLocaleString()} combinaciones`}
                    >
                        {porcentajeOmegaHistorico.toFixed(2)}%
                    </div>
                    <div 
                        className="bar-segment no-omega" 
                        style={{ width: `${porcentajeNoOmegaHistorico}%` }}
                        title={`No Omega: ${combinacionesNoOmegaHistoricas.toLocaleString()} combinaciones`}
                    >
                         {porcentajeNoOmegaHistorico.toFixed(2)}%
                    </div>
                </div>
                <div className="legend">
                    <div><span className="dot omega"></span>Clase Omega</div>
                    <div><span className="dot no-omega"></span>No Omega</div>
                </div>
            </div>

            <div className="chart-container">
                <h4>Basado en Todas las Combinaciones Posibles ({totalCombinacionesPosibles.toLocaleString()})</h4>
                <div className="chart-bar">
                     <div 
                        className="bar-segment omega" 
                        style={{ width: `${porcentajeOmegaTotal}%` }}
                        title={`Clase Omega: ${combinacionesOmegaTotales.toLocaleString()} combinaciones`}
                    >
                        {porcentajeOmegaTotal.toFixed(2)}%
                    </div>
                    <div 
                        className="bar-segment no-omega" 
                        style={{ width: `${porcentajeNoOmegaTotal}%` }}
                        title={`No Omega: ${combinacionesNoOmegaTotales.toLocaleString()} combinaciones`}
                    >
                        {porcentajeNoOmegaTotal.toFixed(2)}%
                    </div>
                </div>
                 <div className="legend">
                    <div><span className="dot omega"></span>Clase Omega</div>
                    <div><span className="dot no-omega"></span>No Omega</div>
                </div>
            </div>
        </div>
    );
};

export default DistributionCharts;
