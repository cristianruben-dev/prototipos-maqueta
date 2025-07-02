import { useCallback, useEffect } from 'react';
import {
  ReactFlow,
  useNodesState,
  useEdgesState,
  Controls,
  MiniMap,
  Background,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';

import { useDataHistory } from './hook/useDataHistory';
import { useMQTT } from './hook/useMQTT';
import { TanqueNode } from './nodes/TanqueNode';
import { ValvulaNode } from './nodes/ValvulaNode';
import { GraficasPanel } from './nodes/GraficasPanel';
import { initialNodes, initialEdges } from './config/nodePositions';
import ConnectionLine from './components/ConnectionLine';

const nodeTypes = {
  tanque: TanqueNode,
  valvula: ValvulaNode,
};

export default function App() {
  const [nodes, setNodes] = useNodesState(initialNodes);
  const [edges] = useEdgesState(initialEdges);

  const { historia, agregarDatos, getDatosGrafico } = useDataHistory(10);
  const { data, connected } = useMQTT("ws://localhost:9001", "tanques/datos");

  const handleValvulaToggle = useCallback((id, estado) => {
    console.log(`Válvula ${id} ${estado ? 'abierta' : 'cerrada'}`);
  }, []);

  // Actualizar cuando lleguen datos
  useEffect(() => {
    if (!data || !connected) return;

    try {
      const datos = JSON.parse(data);

      // Actualizar historial
      const valvulas = [1, 2, 3].map(id => ({
        id,
        presion: datos[`valvula${id}_presion`] || 0,
        estado: datos[`valvula${id}_estado`] || false
      }));
      agregarDatos(valvulas, datos.flujo || 0);

      // Actualizar nodos súper simple
      setNodes((nds) =>
        nds.map((node) => ({
          ...node,
          data: {
            ...node.data,
            // Mapeo directo para tanques
            ...(node.data.litrosKey && { litros: datos[node.data.litrosKey] || 0 }),
            // Mapeo directo para válvulas
            ...(node.data.presionKey && {
              presion: datos[node.data.presionKey] || 0,
              estado: datos[node.data.estadoKey] || false,
              onToggle: handleValvulaToggle
            }),
          }
        }))
      );
    } catch (error) {
      console.error("Error:", error);
    }
  }, [data, connected, agregarDatos, handleValvulaToggle, setNodes]);

  return (
    <div className="w-full h-screen">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        nodeTypes={nodeTypes}
        connectionLineComponent={ConnectionLine}
        nodesDraggable={false}
        nodesConnectable={true}
        elementsSelectable={true}
      >
        <Background color="#d8d8d8" gap={20} size={2} />
        <Controls className="bg-card border border-border" />
        <MiniMap className="bg-card border border-border" />

        <GraficasPanel
          datosGrafico={getDatosGrafico()}
          historia={historia}
          connected={connected}
        />
      </ReactFlow>
    </div>
  );
}
