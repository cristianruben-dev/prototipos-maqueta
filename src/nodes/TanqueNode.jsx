import { Handle, Position } from '@xyflow/react';
import { Tanque } from '../components/tanque';
import { Card } from "@/components/ui/card";

export function TanqueNode({ data }) {
  return (
    <Card className="min-w-[180px] relative p-4">
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

      <span className="text-xs text-muted-foreground text-center">
        {data.label}
      </span>
    </Card>
  );
} 