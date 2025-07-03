import { useEffect, useMemo, useCallback, useState } from 'react';
import {
  ReactFlow,
  useNodesState,
  useEdgesState,
  Controls,
  Background,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';

import { useDataHistory } from './hook/useDataHistory';
import { useMQTT } from './hook/useMQTT';
import { TanqueNode } from './nodes/TanqueNode';
import { ValvulaNode } from './nodes/ValvulaNode';
import { GraficasPanel } from './nodes/GraficasPanel';
import { ConnectionStatus } from './components/ConnectionStatus';
import { initialNodes, initialEdges } from './config/nodePositions';
import ConnectionLine from './components/ConnectionLine';

const nodeTypes = {
  tanque: TanqueNode,
  valvula: ValvulaNode,
};

export default function App() {
  const [nodes, setNodes] = useNodesState(initialNodes);
  const [edges] = useEdgesState(initialEdges);
  const [lastDataTime, setLastDataTime] = useState(null);

  const { historia, agregarDatos, getDatosGrafico, sessionStartTime, limpiarHistorial } = useDataHistory(60);
  const { data, connected, sendCommand } = useMQTT("ws://localhost:9001", "tanques/datos");

  // Memoizar datos de gráficas para evitar re-renders infinitos
  const datosGrafico = useMemo(() => {
    return getDatosGrafico();
  }, [historia]);

  // Función simple con useCallback para evitar re-renders
  const handleValvulaToggle = useCallback((id, estado) => {
    const comando = {
      tipo: 'valvula',
      id: id,
      estado: estado
    };
    if (sendCommand) {
      sendCommand('tanques/comandos', comando);
    }
  }, [sendCommand]);

  // Actualizar cuando lleguen datos - MUY SIMPLIFICADO
  useEffect(() => {
    if (!data || !connected) return;

    try {
      const datos = JSON.parse(data);

      // Actualizar timestamp de últimos datos
      setLastDataTime(Date.now());

      const valvulas = [1, 2, 3].map(id => ({
        id,
        presion: datos[`valvula${id}_presion`] || 0,
        estado: datos[`valvula${id}_estado`] || false
      }));
      agregarDatos(valvulas);

    } catch (error) {
      console.error("Error:", error);
    }
  }, [data, connected]);

  // Rehabilitamos la actualización de nodos de forma segura
  useEffect(() => {
    if (!data || !connected) return;

    try {
      const datos = JSON.parse(data);

      // Actualizar nodos de forma controlada
      setNodes((prevNodes) => {
        return prevNodes.map((node) => {
          // Solo actualizar si hay cambios reales
          if (node.data.litrosKey && datos[node.data.litrosKey] !== node.data.litros) {
            return {
              ...node,
              data: {
                ...node.data,
                litros: datos[node.data.litrosKey] || 0
              }
            };
          }

          if (node.data.presionKey) {
            const nuevaPresion = datos[node.data.presionKey] || 0;
            const nuevoEstado = datos[node.data.estadoKey] || false;

            // Solo actualizar si hay cambios
            if (nuevaPresion !== node.data.presion || nuevoEstado !== node.data.estado) {
              return {
                ...node,
                data: {
                  ...node.data,
                  presion: nuevaPresion,
                  estado: nuevoEstado,
                  onToggle: handleValvulaToggle
                }
              };
            }
          }

          return node;
        });
      });
    } catch (error) {
      console.error("Error:", error);
    }
  }, [data, connected, handleValvulaToggle]);

  return (
    <div className="w-full h-screen relative">
      {/* Status de conexión y datos */}
      <ConnectionStatus connected={connected} lastDataTime={lastDataTime} />

      <ReactFlow
        nodes={nodes}
        edges={edges}
        nodeTypes={nodeTypes}
        connectionLineComponent={ConnectionLine}
      >
        <Background
          color="#f1f1f1"
          gap={20}
          size={2}
          variant="lines"
        />
        <Controls className="bg-card border border-border" />

        <GraficasPanel
          datosGrafico={datosGrafico}
          historia={historia}
          connected={connected}
          sessionStartTime={sessionStartTime}
          onLimpiarHistorial={limpiarHistorial}
        />
      </ReactFlow>
    </div>
  );
}
