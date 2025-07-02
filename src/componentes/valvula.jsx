import { useState } from 'react';
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export function Valvula({ id, presion, estado, onToggle }) {
  const [isOpen, setIsOpen] = useState(estado || false);

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
    <Card className="w-full max-w-[180px]">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium">Válvula {id}</span>
          <Badge variant={isOpen ? "default" : "secondary"}>
            {isOpen ? "Abierta" : "Cerrada"}
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="pt-0">
        <div className="space-y-3">
          {/* Indicador de presión */}
          <div className="flex justify-between items-center">
            <span className="text-xs text-muted-foreground">Presión:</span>
            <Badge variant={getPresionVariant()}>
              {presion} kPa
            </Badge>
          </div>

          {/* Botón de control */}
          <Button
            onClick={handleToggle}
            variant={isOpen ? "destructive" : "default"}
            className="w-full"
            size="sm"
          >
            {isOpen ? "Cerrar" : "Abrir"}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
} 