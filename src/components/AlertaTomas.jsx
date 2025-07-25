import { AlertTriangle, Droplets } from 'lucide-react';

const AlertaTomas = ({ tomasActivas }) => {
  if (!tomasActivas || tomasActivas.length === 0) return null;

  return (
    <div className="fixed top-4 left-4 z-50 bg-red-50 border-2 border-red-500 rounded p-4 max-w-xs">
      <div className="flex items-center gap-2 mb-3">
        <AlertTriangle className="text-red-600 w-5 h-5 animate-pulse" />
        <h3 className="text-red-700 font-bold text-sm">Detección de Fuga</h3>
      </div>

      <div className="text-red-600 mb-3">
        <p className="text-xs mb-2">
          Se ha detectado una posible fuga en el sistema entre el sensor post válvula 1 y el sensor pre válvula 2.
        </p>
        <p className="text-xs text-red-500">
          Revise las conexiones y tuberías en este tramo del sistema.
        </p>
      </div>

      <div className="space-y-1">
        {tomasActivas.map((toma, index) => (
          <div key={index} className="flex items-center gap-2 text-xs">
            <Droplets className="text-red-500 w-3 h-3" />
            <span className="text-red-800">
              <strong>{toma.nombre}</strong>
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AlertaTomas;