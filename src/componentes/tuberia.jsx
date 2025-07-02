import { Badge } from "@/components/ui/badge";

export function Tuberia({ flujo, direccion = 'horizontal' }) {
  // Determinar la velocidad de la animación basada en el flujo
  const velocidad = Math.max(1, 10 - flujo); // Más flujo = animación más rápida

  // Determinar el estilo basado en la dirección
  const estiloContenedor = {
    position: 'relative',
    height: direccion === 'horizontal' ? '16px' : '80px',
    width: direccion === 'horizontal' ? '80px' : '16px',
    backgroundColor: 'hsl(var(--muted))',
    borderRadius: '8px',
    overflow: 'hidden',
    border: '1px solid hsl(var(--border))'
  };

  // Estilo para el flujo
  const estiloFlujo = {
    position: 'absolute',
    width: '100%',
    height: '100%',
    backgroundImage: flujo > 0 ? 'linear-gradient(90deg, transparent 0%, hsl(var(--primary)) 50%, transparent 100%)' : 'none',
    backgroundSize: '100px 100%',
    backgroundPosition: '0 0',
    animation: flujo > 0 ? `flow${direccion === 'horizontal' ? 'H' : 'V'} ${velocidad}s linear infinite` : 'none',
    opacity: flujo > 0 ? 0.8 : 0
  };

  return (
    <div className="flex items-center space-x-3">
      <Badge variant="outline" className="text-xs">
        {flujo.toFixed(1)} L/s
      </Badge>
      <div style={estiloContenedor}>
        <div style={estiloFlujo}></div>
      </div>
      <style jsx>{`
        @keyframes flowH {
          0% { background-position: -100px 0; }
          100% { background-position: 100px 0; }
        }
        @keyframes flowV {
          0% { background-position: 0 -100px; }
          100% { background-position: 0 100px; }
        }
      `}</style>
    </div>
  );
} 