import React from 'react';
import { Badge } from "@/components/ui/badge";

export const Sensor = React.memo(function Sensor({ presion = 0, label = "Sensor", tipo = "entrada" }) {
  // Convertir de kPa a PSI (1 kPa = 0.145038 PSI)
  const presionPSI = presion * 0.145038;

  return (
    <div className="flex flex-col items-center space-y-2">
      <Badge variant="outline" className="text-[8px] px-1 py-0">
        {presionPSI.toFixed(1)} PSI
      </Badge>

      <div className='w-1 h-1 rounded-full mx-auto bg-neutral-500'></div>
    </div>
  );
});