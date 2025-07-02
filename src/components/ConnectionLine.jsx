import React from 'react';
import { useConnection } from '@xyflow/react';

export default function ConnectionLine({ fromX, fromY, toX, toY }) {
  const { fromHandle } = useConnection();

  // Calcular el path para una línea curvada suave
  const controlX = fromX + (toX - fromX) * 0.6;
  const controlY = fromY;

  // Color dinámico basado en el handle
  const strokeColor = fromHandle?.id?.includes('red') ? '#ef4444' :
    fromHandle?.id?.includes('blue') ? '#3b82f6' :
      fromHandle?.id?.includes('orange') ? '#f97316' : '#3b82f6';

  return (
    <g>
      {/* Línea de fondo más gruesa para efecto de profundidad */}
      <path
        fill="none"
        stroke="rgba(0,0,0,0.1)"
        strokeWidth={6}
        strokeDasharray="10,5"
        d={`M${fromX},${fromY} Q ${controlX} ${controlY} ${toX},${toY}`}
      />
      {/* Línea principal animada */}
      <path
        fill="none"
        stroke={strokeColor}
        strokeWidth={4}
        strokeDasharray="8,4"
        className="connection-line"
        d={`M${fromX},${fromY} Q ${controlX} ${controlY} ${toX},${toY}`}
        style={{
          filter: 'drop-shadow(0 0 4px rgba(59, 130, 246, 0.4))'
        }}
      />
      {/* Círculo de destino */}
      <circle
        cx={toX}
        cy={toY}
        fill="#fff"
        r={5}
        stroke={strokeColor}
        strokeWidth={2}
        style={{
          filter: 'drop-shadow(0 0 3px rgba(0, 0, 0, 0.2))'
        }}
      />
      {/* Punto de origen */}
      <circle
        cx={fromX}
        cy={fromY}
        fill={strokeColor}
        r={3}
        style={{
          filter: 'drop-shadow(0 0 2px rgba(0, 0, 0, 0.3))'
        }}
      />
    </g>
  );
} 