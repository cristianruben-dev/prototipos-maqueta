import React from 'react';
import { Handle, Position } from '@xyflow/react';

const ConnectionNode = () => {
  return (
    <div className="relative">
      {/* Handles que pueden recibir conexiones */}
      <Handle
        type="target"
        position={Position.Top}
        id="top"
        style={{ background: '#555', visibility: 'hidden' }}
      />
      <Handle
        type="target"
        position={Position.Left}
        id="left"
        style={{ background: '#555', visibility: 'hidden' }}
      />
      <Handle
        type="target"
        position={Position.Right}
        id="right"
        style={{ background: '#555', visibility: 'hidden' }}
      />
      <Handle
        type="target"
        position={Position.Bottom}
        id="bottom"
        style={{ background: '#555', visibility: 'hidden' }}
      />

      {/* Handles que pueden enviar conexiones */}
      <Handle
        type="source"
        position={Position.Top}
        id="top-out"
        style={{ background: '#555', visibility: 'hidden' }}
      />
      <Handle
        type="source"
        position={Position.Left}
        id="left-out"
        style={{ background: '#555', visibility: 'hidden' }}
      />
      <Handle
        type="source"
        position={Position.Right}
        id="right-out"
        style={{ background: '#555', visibility: 'hidden' }}
      />
      <Handle
        type="source"
        position={Position.Bottom}
        id="bottom-out"
        style={{ background: '#555', visibility: 'hidden' }}
      />

      <div className="w-1.5 h-1.5 bg-neutral-400 rounded-sm border border-neutral-600"></div>
    </div>
  );
};

export default ConnectionNode; 