import { Badge } from "@/components/ui/badge";
import sensorIcon from "@/assets/sensor.png";

export function Sensor({ presion = 0, label = "Sensor", tipo = "entrada" }) {
  return (
    <div className="flex flex-col items-center space-y-2">
      <img src={sensorIcon} alt="Sensor" className="w-10 object-contain" />

      <Badge variant="outline" className="text-[8px] px-1 py-0">
        {presion.toFixed(1)} kPa
      </Badge>
    </div>
  );
} 