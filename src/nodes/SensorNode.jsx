import { Handle, Position } from '@xyflow/react';
import { Sensor } from '../components/sensor';

export function SensorNode({ data }) {
  return (
    <div className="relative">
      <Handle
        type="target"
        position={Position.Left}
        id="entrada"
        className='mt-[6px]'
      />

      <Sensor
        presion={data.presion || 0}
        label={data.label || "Sensor"}
        tipo={data.tipo || "entrada"}
      />

      <Handle
        type="source"
        position={Position.Right}
        id="salida"
        className='mt-[6px]'
      />
    </div>
  );
} 