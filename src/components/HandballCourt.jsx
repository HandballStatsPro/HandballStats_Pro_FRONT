import React, { useState } from 'react';
import { DETALLE_FINALIZACION, ZONA_LANZAMIENTO } from '../services/accionService';

const HandballCourt = ({ 
  selectedZona, 
  onZonaChange, 
  selectedDetalle, 
  onDetalleChange,
  tipoAtaque,
  disabled = false 
}) => {
  const [hoveredZone, setHoveredZone] = useState(null);

  // Definir las zonas disponibles según el tipo de ataque
  const getAvailableDetalle = () => {
    if (tipoAtaque === 'Contraataque') {
      return [
        { key: DETALLE_FINALIZACION.CONTRAGOL, label: 'Contragol', position: { x: 50, y: 20 } },
        { key: DETALLE_FINALIZACION.PRIMERA_OLEADA, label: '1ª Oleada', position: { x: 30, y: 35 } },
        { key: DETALLE_FINALIZACION.SEGUNDA_OLEADA, label: '2ª Oleada', position: { x: 70, y: 35 } },
        { key: DETALLE_FINALIZACION.TERCERA_OLEADA, label: '3ª Oleada', position: { x: 50, y: 50 } }
      ];
    } else {
      return [
        { key: DETALLE_FINALIZACION.LANZAMIENTO_EXTERIOR, label: 'Lanz. Ext.', position: { x: 50, y: 70 } },
        { key: DETALLE_FINALIZACION.PIVOTE, label: 'Pivote', position: { x: 50, y: 40 } },
        { key: DETALLE_FINALIZACION.PENETRACION, label: 'Penetración', position: { x: 50, y: 55 } },
        { key: DETALLE_FINALIZACION.EXTREMOS, label: 'Extremos', position: { x: 20, y: 45 } },
        { key: DETALLE_FINALIZACION.SIETE_METROS, label: '7m', position: { x: 50, y: 25 } }
      ];
    }
  };

  const zonaOptions = [
    { key: ZONA_LANZAMIENTO.IZQUIERDA, label: 'Izquierda', x: 20, y: 30, width: 25, height: 40 },
    { key: ZONA_LANZAMIENTO.CENTRO, label: 'Centro', x: 37.5, y: 30, width: 25, height: 40 },
    { key: ZONA_LANZAMIENTO.DERECHA, label: 'Derecha', x: 55, y: 30, width: 25, height: 40 }
  ];

  const handleZoneClick = (zona) => {
    if (!disabled) {
      onZonaChange(zona);
    }
  };

  const handleDetalleClick = (detalle) => {
    if (!disabled) {
      onDetalleChange(detalle);
    }
  };

  return (
    <div className="handball-court-container">
      <h6 className="mb-3 text-center" style={{ color: '#780000' }}>
        Selecciona la zona y detalle de finalización
      </h6>
      
      <div className="position-relative" style={{ height: '400px', width: '100%' }}>
        <svg 
          width="100%" 
          height="400" 
          viewBox="0 0 100 100"
          style={{ border: '2px solid #669bbc', borderRadius: '8px', backgroundColor: '#f8f9fa' }}
        >
          {/* Fondo de la cancha */}
          <rect x="0" y="0" width="100" height="100" fill="#f0f4f8" />
          
          {/* Líneas de la cancha */}
          <line x1="0" y1="0" x2="100" y2="0" stroke="#669bbc" strokeWidth="0.5" />
          <line x1="0" y1="100" x2="100" y2="100" stroke="#669bbc" strokeWidth="0.5" />
          <line x1="0" y1="0" x2="0" y2="100" stroke="#669bbc" strokeWidth="0.5" />
          <line x1="100" y1="0" x2="100" y2="100" stroke="#669bbc" strokeWidth="0.5" />
          
          {/* Línea central */}
          <line x1="0" y1="50" x2="100" y2="50" stroke="#669bbc" strokeWidth="0.3" strokeDasharray="2,2" />
          
          {/* Área de portería */}
          <path d="M 15 20 Q 50 5 85 20 L 85 80 Q 50 95 15 80 Z" 
                fill="none" 
                stroke="#669bbc" 
                strokeWidth="0.5" />
          
          {/* Línea de 7 metros */}
          <path d="M 25 25 Q 50 15 75 25" 
                fill="none" 
                stroke="#780000" 
                strokeWidth="0.5" />
          
          {/* Línea de tiros libres */}
          <path d="M 10 35 Q 50 25 90 35" 
                fill="none" 
                stroke="#669bbc" 
                strokeWidth="0.3" />
          
          {/* Zonas de lanzamiento */}
          {zonaOptions.map((zona) => (
            <rect
              key={zona.key}
              x={zona.x}
              y={zona.y}
              width={zona.width}
              height={zona.height}
              fill={selectedZona === zona.key ? '#669bbc' : 'transparent'}
              fillOpacity={selectedZona === zona.key ? 0.3 : 0.1}
              stroke={selectedZona === zona.key ? '#669bbc' : '#cccccc'}
              strokeWidth="1"
              className={!disabled ? 'handball-zone' : ''}
              style={{ cursor: disabled ? 'not-allowed' : 'pointer' }}
              onClick={() => handleZoneClick(zona.key)}
              onMouseEnter={() => !disabled && setHoveredZone(zona.key)}
              onMouseLeave={() => setHoveredZone(null)}
            />
          ))}
          
          {/* Etiquetas de zonas */}
          {zonaOptions.map((zona) => (
            <text
              key={`label-${zona.key}`}
              x={zona.x + zona.width/2}
              y={zona.y + zona.height/2}
              textAnchor="middle"
              dominantBaseline="middle"
              fontSize="3"
              fill={selectedZona === zona.key ? '#780000' : '#666666'}
              fontWeight={selectedZona === zona.key ? 'bold' : 'normal'}
              style={{ cursor: disabled ? 'not-allowed' : 'pointer' }}
              onClick={() => handleZoneClick(zona.key)}
            >
              {zona.label}
            </text>
          ))}
          
          {/* Puntos de detalle de finalización */}
          {getAvailableDetalle().map((detalle) => (
            <g key={detalle.key}>
              <circle
                cx={detalle.position.x}
                cy={detalle.position.y}
                r="3"
                fill={selectedDetalle === detalle.key ? '#780000' : '#669bbc'}
                stroke="#ffffff"
                strokeWidth="0.5"
                className={!disabled ? 'handball-detail' : ''}
                style={{ cursor: disabled ? 'not-allowed' : 'pointer' }}
                onClick={() => handleDetalleClick(detalle.key)}
              />
              <text
                x={detalle.position.x}
                y={detalle.position.y - 5}
                textAnchor="middle"
                fontSize="2.5"
                fill="#333333"
                fontWeight="600"
                style={{ cursor: disabled ? 'not-allowed' : 'pointer' }}
                onClick={() => handleDetalleClick(detalle.key)}
              >
                {detalle.label}
              </text>
            </g>
          ))}
        </svg>
        
        {/* Leyenda */}
        <div className="mt-3">
          <div className="d-flex justify-content-around text-center">
            <div>
              <small className="text-muted">Zonas de Lanzamiento</small>
              <div className="d-flex justify-content-center gap-2 mt-1">
                {zonaOptions.map((zona) => (
                  <div
                    key={zona.key}
                    className={`badge ${selectedZona === zona.key ? 'bg-primary' : 'bg-secondary'}`}
                    style={{ cursor: disabled ? 'not-allowed' : 'pointer' }}
                    onClick={() => handleZoneClick(zona.key)}
                  >
                    {zona.label}
                  </div>
                ))}
              </div>
            </div>
            <div>
              <small className="text-muted">Detalle de Finalización</small>
              <div className="d-flex flex-wrap justify-content-center gap-1 mt-1">
                {getAvailableDetalle().map((detalle) => (
                  <div
                    key={detalle.key}
                    className={`badge ${selectedDetalle === detalle.key ? 'bg-danger' : 'bg-info'}`}
                    style={{ 
                      cursor: disabled ? 'not-allowed' : 'pointer',
                      fontSize: '0.7rem'
                    }}
                    onClick={() => handleDetalleClick(detalle.key)}
                  >
                    {detalle.label}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <style jsx>{`
        .handball-zone:hover {
          fill-opacity: 0.2 !important;
        }
        .handball-detail:hover {
          r: 4 !important;
        }
      `}</style>
    </div>
  );
};

export default HandballCourt;