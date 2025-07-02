import { useEffect } from 'react';
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
  const { data, connected, sendCommand } = useMQTT("ws://localhost:9001", "tanques/datos");

  // Función simple sin useCallback para evitar problemas
  const handleValvulaToggle = (id, estado) => {
    console.log(`Válvula ${id} ${estado ? 'abierta' : 'cerrada'}`);

    const comando = {
      tipo: 'valvula',
      id: id,
      estado: estado
    };
    if (sendCommand) {
      sendCommand('tanques/comandos', comando);
    }
  };

  // Actualizar cuando lleguen datos - MUY SIMPLIFICADO
  useEffect(() => {
    if (!data || !connected) return;

    try {
      const datos = JSON.parse(data);

      // Solo actualizar historial, NO los nodos por ahora
      const valvulas = [1, 2, 3].map(id => ({
        id,
        presion: datos[`valvula${id}_presion`] || 0,
        estado: datos[`valvula${id}_estado`] || false
      }));
      agregarDatos(valvulas);

    } catch (error) {
      console.error("Error:", error);
    }
  }, [data, connected, agregarDatos]);

  // Rehabilitamos la actualización de nodos de forma segura
  useEffect(() => {
    if (!data || !connected) return;

    try {
      const datos = JSON.parse(data);

      // Actualizar nodos de forma controlada
      setNodes((prevNodes) => {
        return prevNodes.map((node) => {
          // Crear copia del nodo
          const updatedNode = { ...node };

          // Solo actualizar si hay cambios reales
          if (node.data.litrosKey && datos[node.data.litrosKey] !== node.data.litros) {
            updatedNode.data = {
              ...node.data,
              litros: datos[node.data.litrosKey] || 0
            };
          }

          if (node.data.presionKey) {
            const nuevaPresion = datos[node.data.presionKey] || 0;
            const nuevoEstado = datos[node.data.estadoKey] || false;

            // Solo actualizar si hay cambios
            if (nuevaPresion !== node.data.presion || nuevoEstado !== node.data.estado) {
              updatedNode.data = {
                ...node.data,
                presion: nuevaPresion,
                estado: nuevoEstado,
                onToggle: handleValvulaToggle
              };
            }
          }

          return updatedNode;
        });
      });
    } catch (error) {
      console.error("Error:", error);
    }
  }, [data, connected]);

  return (
    <div className="w-full h-screen">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        nodeTypes={nodeTypes}
        connectionLineComponent={ConnectionLine}
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
