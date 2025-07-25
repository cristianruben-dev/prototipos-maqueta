import React from 'react';
import { AlertTriangle, Droplets } from 'lucide-react';

const FugaOverlay = ({ isVisible, onClose }) => {
  if (!isVisible) return null;

  return (
    <>
      {/* Elemento flotante indicador de fuga */}
      <div className="fixed z-40" style={{ top: '45%', left: '48%' }}>
        <div className="relative">
          <div className="w-8 h-8 bg-red-500 rounded-full animate-ping absolute"></div>
          <div className="w-8 h-8 bg-red-600 rounded-full flex items-center justify-center relative">
            <Droplets className="w-4 h-4 text-white animate-pulse" />
          </div>
        </div>
      </div>

      {/* Modal principal */}
      <div className="fixed inset-0 bg-black/10 bg-opacity-40 backdrop-blur-sm flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-8 max-w-lg mx-4 shadow-lg border-2 border-red-300">
          <div className="flex items-center mb-6">
            <AlertTriangle className="h-8 w-8 text-red-500 mr-4 animate-pulse" />
            <h2 className="text-xl font-semibold text-red-700">Detección de Fuga</h2>
          </div>

          <div className="text-red-600 mb-8">
            <p className="text-base mb-3">
              Se ha detectado una posible fuga en el sistema entre el sensor post válvula 1 y el sensor pre válvula 2.
            </p>
            <p className="text-sm text-red-500">
              Revise las conexiones y tuberías en este tramo del sistema.
            </p>
          </div>

          <div className="flex justify-end">
            <button
              onClick={onClose}
              className="px-6 py-3 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors font-medium"
            >
              Entendido
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default FugaOverlay;