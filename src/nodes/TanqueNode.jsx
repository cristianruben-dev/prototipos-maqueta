import { Handle, Position } from '@xyflow/react';
import { Tanque } from '../components/tanque';
import { Card } from "@/components/ui/card";

export function TanqueNode({ data }) {
  return (
    <div className='flex flex-col items-center'>

      <Tanque
        litros={data.litros || 0}
        capacidad={data.capacidad || 1000}
      />

      <Handle
        type="target"
        position={Position.Top}
        id="entrada"
      />

      <Handle
        type="source"
        position={Position.top}
        id="salida"
      />

      <span className="text-[9px] text-muted-foreground text-center mt-2">
        {data.label}
      </span>
    </div>
  );
} 