import { Handle, Position } from '@xyflow/react';

export function SensorNode() {
  return (
    <div className="relative">
      <Handle
        type="target"
        position={Position.Left}
        id="entrada"
        className='mt-[6px]'
      />

      <div className='w-10 h-10 bg-red-500 rounded-full'/>

      <Handle
        type="source"
        position={Position.Right}
        id="salida"
        className='mt-[6px]'
      />
    </div>
  );
} 