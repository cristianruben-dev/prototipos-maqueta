import React from 'react';
import { Droplets } from 'lucide-react';

export const Fuga = React.memo(function Fuga({ data }) {
  if (!data.visible) return null;

  return (
    <div className="space-y-2">
      <div className="relative flex justify-center">
        {/* Indicador central de fuga */}
        <div className="w-4 h-4 rounded-full bg-red-300 border-2 border-red-400 shadow-lg shadow-red-500/50 flex items-center justify-center">
          <Droplets className="w-2 h-2 text-white" />
        </div>

        {/* Animaciones de fuga */}
        <>
          {/* Onda de fuga principal */}
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-28 h-28 rounded-full bg-red-400 animate-ping opacity-70 pointer-events-none"></div>

          {/* Partículas de fuga */}
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-3 h-3 rounded-full bg-red-300 animate-bounce opacity-85 pointer-events-none" style={{ animationDelay: '0.1s' }}></div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-2 h-2 rounded-full bg-red-200 animate-pulse opacity-90 pointer-events-none" style={{ animationDelay: '0.3s' }}></div>

          {/* Efecto de fuga continuo */}
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-10 h-10 rounded-full border-2 border-red-300 animate-ping opacity-50 pointer-events-none" style={{ animationDelay: '0.5s' }}></div>

          {/* Anillo adicional para mayor visibilidad */}
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-12 h-12 rounded-full border border-red-200 animate-ping opacity-30 pointer-events-none" style={{ animationDelay: '0.8s' }}></div>
        </>
      </div>

    </div>
  );
});

export default Fuga;