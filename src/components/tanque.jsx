import React from 'react';
import { Badge } from "@/components/ui/badge";

export const Tanque = React.memo(function Tanque({ litros, capacidad = 1000 }) {
  const porcentaje = Math.min(100, (litros / capacidad) * 100);

  return (
    <div className="flex flex-col items-center space-y-3">
      <div className="relative w-[78px] h-[125px] border-2 border-border rounded overflow-hidden bg-card">
        <div
          className="absolute bottom-0 w-full bg-blue-500 transition-all duration-300"
          style={{
            height: `${porcentaje}%`,
            opacity: 0.6
          }}
        />
        <Badge
          className="absolute bottom-4 left-1/2 -translate-x-1/2 text-[10px]"
          variant="secondary"
        >
          {porcentaje.toFixed(0)}%
        </Badge>
      </div>

      <div className="flex items-center space-x-1 text-[10px]">
        <span className="font-semibold text-primary">{litros.toFixed(0)}</span>
        <span className="text-muted-foreground">/ {capacidad}L</span>
      </div>
    </div>
  );
});