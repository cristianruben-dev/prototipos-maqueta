import { Badge } from "@/components/ui/badge";

export function Tanque({ litros, capacidad = 1000 }) {
  const porcentaje = Math.min(100, (litros / capacidad) * 100);

  // Determinar el color del badge según el nivel
  const getBadgeVariant = () => {
    if (porcentaje < 20) return "destructive";
    if (porcentaje < 50) return "default";
    return "secondary";
  };

  return (
    <div className="flex flex-col items-center space-y-2">
      {/* Información del tanque */}
      <div className="flex items-center space-x-2">
        <span className="text-lg font-semibold text-primary">{litros.toFixed(0)}</span>
        <span className="text-xs text-muted-foreground">/ {capacidad}L</span>
        <Badge variant={getBadgeVariant()}>
          {porcentaje.toFixed(0)}%
        </Badge>
      </div>

      {/* Contenedor del tanque visual */}
      <div className="relative w-[120px] h-[180px] border-2 border-border rounded-md overflow-hidden bg-card">
        {/* Líquido del tanque */}
        <div
          className="absolute bottom-0 w-full bg-primary transition-all duration-300"
          style={{
            height: `${porcentaje}%`,
            opacity: 0.6
          }}
        />
      </div>
    </div>
  );
}