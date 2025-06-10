import { useState } from 'react';

export function Valvula({ id, presion, estado, onToggle }) {
  const [isOpen, setIsOpen] = useState(estado || false);
  
  const handleToggle = () => {
    const newState = !isOpen;
    setIsOpen(newState);
    if (onToggle) {
      onToggle(id, newState);
    }
  };

  return (
    <div className="bg-white border border-gray-200 rounded-md p-3 w-full max-w-[180px]">
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm font-medium text-gray-700">Válvula {id}</span>
        <div className={`h-2 w-2 rounded-full ${isOpen ? 'bg-green-500' : 'bg-red-500'}`}></div>
      </div>
      
      <div className="space-y-2">
        {/* Indicadores simplificados */}
        <div className="flex justify-between items-center text-xs">
          <span className="text-gray-500">Presión:</span>
          <span className={`font-medium ${
            presion < 30 ? "text-green-500" : 
            presion < 70 ? "text-yellow-500" : "text-red-500"
          }`}>{presion} kPa</span>
        </div>
        
        
        {/* Botón minimalista */}
        <button
          onClick={handleToggle}
          className={`w-full py-1 px-2 rounded text-xs font-medium text-white transition-colors ${
            isOpen 
              ? "bg-red-500 hover:bg-red-600" 
              : "bg-green-500 hover:bg-green-600"
          }`}
        >
          {isOpen ? "Cerrar" : "Abrir"}
        </button>
      </div>
    </div>
  );
} 