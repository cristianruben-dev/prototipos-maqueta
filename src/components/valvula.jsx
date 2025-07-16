import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";

import valvulaIcon from '../assets/valvula.png';

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
      <div className='flex flex-col items-center justify-center gap-1'>
        <span className="text-xs font-medium opacity-0">Válvula {id}</span>
        <img src={valvulaIcon} alt="Valvula" className="w-20 object-contain" />
      </div>

      <div className='flex justify-center'>
        <Button
          onClick={handleToggle}
          variant={isOpen ? "destructive" : "default"}
          className="w-fit text-[9px] mx-auto py-0"
          size="sm"
        >
          {isOpen ? "Cerrar" : "Abrir"}
        </Button>
      </div>
    </div>
  );
} 