import { useState, useEffect } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

import valvulaIcon from '../assets/valvula.png';

export function Valvula({ id, presion, estado, onToggle }) {
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

  // Determinar el color del badge de presión
  const getPresionVariant = () => {
    if (presion < 30) return "secondary";
    if (presion < 70) return "default";
    return "destructive";
  };

  return (
    <div className="space-y-2.5">

      <Badge className='text-[10px] mx-auto border border-neutral-400 w-full' variant={getPresionVariant()}>
        {presion} kPa
      </Badge>

      <div className='flex flex-col items-center justify-center gap-1'>
        <span className="text-xs font-medium">Válvula {id}</span>
        <img src={valvulaIcon} alt="Valvula" className="w-24 object-contain" />
      </div>

      <Button
        onClick={handleToggle}
        variant={isOpen ? "destructive" : "default"}
        className="w-full"
        size="sm"
      >
        {isOpen ? "Cerrar" : "Abrir"}
      </Button>
    </div>
  );
} 