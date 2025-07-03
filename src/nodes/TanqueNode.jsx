import { Handle, Position } from '@xyflow/react';
import { Tanque } from '../components/tanque';
import { Card } from "@/components/ui/card";

export function TanqueNode({ data }) {
  return (
    <div className='flex flex-col items-center'>
      <Card className="min-w-[140px] relative p-3 py-4">
        <Tanque
          litros={data.litros || 0}
          capacidad={data.capacidad || 1000}
        />

        <Handle
          type="target"
          position={Position.Left}
          id="entrada"
        />

        <Handle
          type="source"
          position={Position.Right}
          id="salida"
        />


      </Card>

      <span className="text-xs text-muted-foreground text-center mt-2">
        {data.label}
      </span>
    </div>
  );
} 