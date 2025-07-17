import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";

export function Valvula({ id, estado, onToggle }) {
  const [isOpen, setIsOpen] = useState(estado || false);

  useEffect(() => {
    setIsOpen(estado);
  }, [estado]);

  const handleToggle = () => {
    const newState = !isOpen;
    setIsOpen(newState);
    if (onToggle) {
      onToggle(id, newState);
    }
  };

  return (
    <div className="space-y-2">
      <div className="relative flex justify-center">
        <div
          className={`w-2 h-2 rounded-full transition-all duration-300 ${isOpen
            ? 'bg-green-500 shadow-lg shadow-green-500/50 animate-pulse'
            : 'bg-gray-400'
            }`}
        >
        </div>
        {isOpen && (
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-4 h-4 rounded-full bg-gradient-to-tr from-green-300 to-green-500 animate-ping opacity-70"></div>
        )}
      </div>

      <div className='flex justify-center'>
        <Button
          onClick={handleToggle}
          variant={isOpen ? "destructive" : "default"}
          className="text-[9px] mx-auto w-[36px]"
          size="sm"
        >
          {isOpen ? "Cerrar" : "Abrir"}
        </Button>
      </div>
    </div>
  );
}