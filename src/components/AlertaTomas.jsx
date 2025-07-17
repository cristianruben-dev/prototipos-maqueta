import { AlertTriangle, Droplets } from 'lucide-react';

const AlertaTomas = ({ tomasActivas }) => {
  if (!tomasActivas || tomasActivas.length === 0) return null;

  return (
    <div className="fixed top-4 left-4 z-50 bg-red-50 border-2 border-red-500 rounded p-4">
      <div className="flex items-center gap-2 mb-2">
        <AlertTriangle className="text-red-600 w-5 h-5" />
        <h3 className="text-red-700 font-bold text-sm">¡FUGAS DETECTADAS!</h3>
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