import { Handle, Position } from '@xyflow/react';
import { Tanque } from '../components/tanque';
import { Card, CardHeader, CardTitle } from "@/components/ui/card";

export function TanqueNode({ data }) {
  return (
    <Card className="min-w-[200px] relative">
      <CardHeader>
        <CardTitle className="text-sm text-center">{data.label}</CardTitle>
      </CardHeader>

      <Tanque
        litros={data.litros || 0}
        capacidad={data.capacidad || 1000}
      />

      {/* Handles de entrada y salida para todos los tanques */}
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
  );
} 