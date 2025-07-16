import React from 'react';
import { Handle, Position } from '@xyflow/react';
import { Button } from "@/components/ui/button";
import { AlertTriangleIcon } from 'lucide-react';

const TomaClandestina = ({ data }) => {
  const { id, estado, onToggle } = data;

  const handleToggle = () => {
    const newState = !estado;
    console.log(`🚰 TomaClandestina ${id}: ${estado} -> ${newState}`);
    console.log(`🚰 onToggle disponible:`, !!onToggle);
    if (onToggle) {
      onToggle(id, newState);
    } else {
      console.error(`❌ onToggle no está definido para toma ${id}`);
    }
  };

  return (
    <div className="relative">
      {/* Handle de entrada */}
      <Handle
        type="target"
        position={Position.Left}
        id="entrada"
        className='mt-[51px]'
      />

      {/* Handle de salida hacia el siguiente componente */}
      <Handle
        type="source"
        position={Position.Right}
        id="salida"
        className='mt-[51px]'
      />

      {/* Handle de salida hacia abajo (fuga) */}
      <Handle
        type="source"
        position={Position.Bottom}
        id="fuga"
        style={{
          background: '#ff4444',
          width: 6,
          height: 6,
          bottom: -3,
          visibility: estado ? 'visible' : 'hidden'
        }}
      />

      {/* Componente visual */}
      <div>
        <Button
          onClick={handleToggle}
          variant={estado ? "destructive" : "default"}
          className="w-fit text-[9px] mx-auto mb-3"
          size="sm"
        >
          {estado ? "Cerrar" : "Abrir"}
        </Button>
        <div className='flex items-center justify-center bg-neutral-200 rounded-sm p-1'>
          <div className={`
            text-2xl transition-all duration-300
            ${estado ? 'text-red-500' : 'text-gray-400'}
          `}>
            <AlertTriangleIcon className='w-4 h-4' />
          </div>
        </div>
        <div className='w-1 h-10 bg-red-500 mx-auto'></div>
        <div className='w-3 h-3 bg-red-500 rounded-full mx-auto' />
      </div>
    </div>
  );
};

export default TomaClandestina; 