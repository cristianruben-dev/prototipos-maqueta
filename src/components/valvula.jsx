import React from 'react';
import { Button } from "@/components/ui/button";

export const Valvula = React.memo(function Valvula({ id, estado, onToggle }) {
  const isOpen = estado || false;

  const handleToggle = () => {
    const newState = !isOpen;
    if (onToggle) {
      onToggle(id, newState);
    }
  };

  return (
    <div className="space-y-2">
      <div className="relative flex justify-center">
        {/* Válvula principal */}
        <div
          className={`w-4 h-4 rounded-full transition-all duration-300 border-2 ${isOpen
            ? 'bg-green-500 border-green-600 shadow-lg shadow-green-500/50'
            : 'bg-gray-400 border-gray-500'
            }`}
        >
        </div>

        {/* Animaciones de flujo cuando está abierta */}
        {isOpen && (
          <>
            {/* Onda de flujo principal */}
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-3 h-3 rounded-full bg-blue-400 animate-ping opacity-70 pointer-events-none"></div>
          </>
        )}
      </div>

      <div className='flex justify-center relative z-10'>
        <Button
          onClick={handleToggle}
          variant={isOpen ? "destructive" : "default"}
          className="text-[9px] mx-auto w-[36px] cursor-pointer"
          size="sm"
        >
          {isOpen ? "Cerrar" : "Abrir"}
        </Button>
      </div>
    </div>
  );
});