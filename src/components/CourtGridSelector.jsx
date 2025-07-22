import React from 'react';
import { ZONA_LANZAMIENTO, DETALLE_FINALIZACION, TIPO_ATAQUE } from '../services/accionService';

// --- CONFIGURACIÓN DE GRIDS ---
// Mapa de botones para el ataque POSICIONAL
const gridLayoutPosicional = [
  { detalle: DETALLE_FINALIZACION.EXTREMOS, label: 'Extremo', row: 1 },
  { detalle: DETALLE_FINALIZACION.SIETE_METROS, label: '7m', row: 1, col: 2 },
  { detalle: DETALLE_FINALIZACION.PIVOTE, label: 'Pivote', row: 2 },
  { detalle: DETALLE_FINALIZACION.PENETRACION, label: 'Penetración', row: 3 },
  { detalle: DETALLE_FINALIZACION.LANZAMIENTO_EXTERIOR, label: 'Lanz. Exterior', row: 4 },
];

// Mapa de botones para el CONTRAATAQUE
const gridLayoutContraataque = [
  { detalle: DETALLE_FINALIZACION.CONTRAGOL, label: 'Contragol', row: 1 },
  { detalle: DETALLE_FINALIZACION.PRIMERA_OLEADA, label: '1ª Oleada', row: 2 },
  { detalle: DETALLE_FINALIZACION.SEGUNDA_OLEADA, label: '2ª Oleada', row: 3 },
  { detalle: DETALLE_FINALIZACION.TERCERA_OLEADA, label: '3ª Oleada', row: 4 },
];

const zonasColumnas = [ZONA_LANZAMIENTO.IZQUIERDA, ZONA_LANZAMIENTO.CENTRO, ZONA_LANZAMIENTO.DERECHA];

const CourtGridSelector = ({ onSelection, tipoAtaque, selectedDetalle, selectedZona }) => {

  // SELECCIÓN DINÁMICA DEL LAYOUT A USAR EN EL GRID
  const activeGridLayout = tipoAtaque === TIPO_ATAQUE.POSICIONAL
    ? gridLayoutPosicional
    : gridLayoutContraataque;

  // La lógica para determinar qué hay en cada celda ahora usa el layout activo
  const getCellDetails = (rowIndex, colIndex) => {
    const row = rowIndex + 1;
    const col = colIndex + 1;

    let specificMatch = activeGridLayout.find(item => item.row === row && item.col === col);
    if (specificMatch) {
      return specificMatch;
    }

    let generalMatch = activeGridLayout.find(item => item.row === row && !item.col);
    if (generalMatch) {
      const isOverridden = activeGridLayout.some(item => item.row === row && item.col === col);
      if (!isOverridden) {
        return generalMatch;
      }
    }
    return null;
  };

  return (
    <div className="court-grid-container">
      <style>{`
        .court-grid-container {
          position: relative;
          width: 100%;
          max-width: 500px;
          aspect-ratio: 4 / 3.5;
          margin: auto;
          background-image: url('/pista_bm.png');
          background-size: cover;
          background-position: center;
          border: 2px solid #669bbc;
          border-radius: 12px;
          overflow: hidden;
          box-shadow: 0 4px 15px rgba(0,0,0,0.2);
        }
        .court-grid {
          width: 100%;
          height: 100%;
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          grid-template-rows: repeat(4, 1fr);
          background-color: rgba(20, 40, 60, 0.2);
        }
        .grid-cell {
          border: 1px solid rgba(255, 255, 255, 0.2);
          cursor: pointer;
          transition: all 0.2s ease-in-out;
          display: flex;
          align-items: center;
          justify-content: center;
          text-align: center;
          color: white;
          font-weight: 600;
          font-size: 1rem;
          text-shadow: 1px 1px 3px rgba(0, 0, 0, 0.8);
          backdrop-filter: blur(1px);
        }
        .grid-cell:not(.empty):hover {
          background-color: rgba(120, 0, 0, 0.7);
          transform: scale(1.05);
          z-index: 10;
        }
        .grid-cell.selected {
          background-color: #780000;
          border: 3px solid #fff;
          transform: scale(1.05);
          box-shadow: inset 0 0 10px rgba(0,0,0,0.5);
          z-index: 5;
        }
        .grid-cell.empty {
          background-color: transparent;
          border: none;
          cursor: default;
          backdrop-filter: none;
        }
      `}</style>

      <div className="court-grid">
        {Array.from({ length: 4 }).map((_, rowIndex) =>
          Array.from({ length: 3 }).map((_, colIndex) => {
            const cellDetails = getCellDetails(rowIndex, colIndex);
            
            if (!cellDetails) {
              return <div key={`${rowIndex}-${colIndex}`} className="grid-cell empty"></div>;
            }
            
            const zona = zonasColumnas[colIndex];
            const { detalle, label } = cellDetails;
            const isSelected = selectedDetalle === detalle && selectedZona === zona;

            return (
              <div
                key={`${rowIndex}-${colIndex}`}
                className={`grid-cell ${isSelected ? 'selected' : ''}`}
                onClick={() => onSelection(zona, detalle)}
              >
                <span>{label}</span>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default CourtGridSelector;