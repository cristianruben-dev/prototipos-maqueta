import { Badge } from "@/components/ui/badge";

export function Sensor({ presion = 0, label = "Sensor", tipo = "entrada" }) {
  return (
    <div className="flex flex-col items-center space-y-2">
      <Badge variant="outline" className="text-[8px] px-1 py-0">
        {presion.toFixed(1)} kPa
      </Badge>

      <div className='w-1 h-1 rounded-full mx-auto bg-neutral-500'></div>
    </div>
  );
} 