import { Handle, Position } from '@xyflow/react';
import { Valvula } from '../components/valvula';

export function ValvulaNode({ data }) {
  const handleValvulaToggle = (id, estado) => {
    if (data.onToggle) {
      data.onToggle(id, estado);
    }
  };

  return (
    <div className="relative">
      <Handle
        type="target"
        position={Position.Left}
        id="entrada"
        className='mt-[8px]'
      />

      <Valvula
        id={data.id}
        estado={data.estado || false}
        onToggle={handleValvulaToggle}
      />

      <Handle
        type="source"
        position={Position.Right}
        id="salida"
        className='mt-[8px]'
      />
    </div>
  );
} 