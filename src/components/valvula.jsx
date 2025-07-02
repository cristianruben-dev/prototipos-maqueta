import { useState, useEffect } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export function Valvula({ id, presion, estado, onToggle }) {
  const [isOpen, setIsOpen] = useState(estado || false);

  // Sincronizar con el estado del MQTT
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

  // Determinar si hay flujo basado en presión y estado
  const hayFlujo = isOpen && presion > 50;

  return (
    <Card className="w-[230px] relative overflow-hidden">
      {/* Efecto de agua fluyendo */}
      {hayFlujo && (
        <div className="absolute inset-0 pointer-events-none">
          <div className="agua-flujo"></div>
        </div>
      )}

      <Badge variant={isOpen ? "default" : "secondary"} className="absolute top-2 right-2 z-10">
        {isOpen ? "Abierta" : "Cerrada"}
      </Badge>

      <CardContent className="relative z-10">
        <div className="space-y-3">
          <span className="text-sm font-medium">Válvula {id}</span>

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