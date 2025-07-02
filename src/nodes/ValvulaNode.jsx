import { Handle, Position } from '@xyflow/react';
import { Valvula } from '../components/valvula';

export function ValvulaNode({ data, isConnectable }) {
  const handleValvulaToggle = (id, estado) => {
    if (data.onToggle) {
      data.onToggle(id, estado);
    }
  };

  return (
    <div className="relative">
      {/* Handle de entrada nativo */}
      <Handle
        type="target"
        position={Position.Left}
        id="entrada"
        isConnectable={isConnectable}
      />

      {/* Componente Valvula */}
      <Valvula
        id={data.id}
        presion={data.presion || 0}
        estado={data.estado || false}
        onToggle={handleValvulaToggle}
      />

      {/* Handle de salida nativo */}
      <Handle
        type="source"
        position={Position.Right}
        id="salida"
        isConnectable={isConnectable}
      />
    </div>
  );
} 