import React from 'react';
import { AlertTriangle, Droplets, X } from 'lucide-react';

const AlertaTomas = ({ tomasActivas, onClose }) => {
  if (!tomasActivas || tomasActivas.length === 0) return null;

  return (
    <div className="fixed top-4 left-4 z-50 bg-red-50 border-2 border-red-500 rounded-lg p-4 shadow-lg max-w-sm">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <AlertTriangle className="text-red-600 w-5 h-5" />
          <h3 className="text-red-700 font-bold text-sm">¡TOMAS CLANDESTINAS DETECTADAS!</h3>
        </div>
        <button
          onClick={onClose}
          className="text-red-500 hover:text-red-700 p-1"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      <div className="space-y-2">
        {tomasActivas.map((toma, index) => (
          <div key={index} className="flex items-center gap-2 text-sm">
            <Droplets className="text-red-500 w-4 h-4" />
            <span className="text-red-800">
              <strong>{toma.nombre}</strong> - {toma.flujo.toFixed(1)}L/s
            </span>
          </div>
        ))}
      </div>

      <div className="mt-3 text-xs text-red-600 bg-red-100 p-2 rounded">
        💡 <strong>Detección:</strong> Caída de presión anormal detectada en el tramo afectado
      </div>
    </div>
  );
};

export default AlertaTomas; 