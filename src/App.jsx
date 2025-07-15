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
import { SensorNode } from './nodes/SensorNode';
import { GraficasPanel } from './nodes/GraficasPanel';
import { ConnectionStatus } from './components/ConnectionStatus';
import { initialNodes, initialEdges } from './config/nodePositions';
import ConnectionLine from './components/ConnectionLine';
import ConnectionNode from './nodes/ConnectionNode';

const nodeTypes = {
  tanque: TanqueNode,
  valvula: ValvulaNode,
  sensor: SensorNode,
  connection: ConnectionNode,
};

export default function App() {
  const [nodes, setNodes] = useNodesState(initialNodes);
  const [edges] = useEdgesState(initialEdges);
  const [lastDataTime, setLastDataTime] = useState(null);

  const { historia, agregarDatos, getDatosGrafico, sessionStartTime, limpiarHistorial } = useDataHistory(60);
  const { data, connected, sendCommand } = useMQTT("ws://localhost:9001", "tanques/datos");

  // Usar getDatosGrafico directamente ya que está memoizado en el hook
  const datosGrafico = getDatosGrafico;

  // Función simple con useCallback para evitar re-renders
  const handleValvulaToggle = useCallback((id, estado) => {
    console.log(`🔧 Intentando cambiar válvula ${id} a ${estado ? 'ABIERTA' : 'CERRADA'}`);
    const comando = {
      tipo: 'valvula',
      id: id,
      estado: estado
    };
    if (sendCommand) {
      sendCommand('tanques/comandos', comando);
      console.log(`📤 Comando enviado a tanques/comandos:`, comando);
    } else {
      console.error('❌ sendCommand no disponible');
    }
  }, [sendCommand]);

  // INICIALIZAR NODOS DE VÁLVULAS CON onToggle desde el inicio
  useEffect(() => {
    setNodes((prevNodes) => {
      return prevNodes.map((node) => {
        // Asignar onToggle a nodos de válvulas desde el inicio
        if (node.type === 'valvula' && !node.data.onToggle) {
          return {
            ...node,
            data: {
              ...node.data,
              onToggle: handleValvulaToggle
            }
          };
        }
        return node;
      });
    });
  }, [handleValvulaToggle]); // Solo se ejecuta una vez cuando handleValvulaToggle esté listo

  // Actualización de nodos para el nuevo sistema
  useEffect(() => {
    if (!data || !connected) return;

    try {
      const datos = JSON.parse(data);

      // Actualizar timestamp de últimos datos
      setLastDataTime(Date.now());

      // Preparar datos para histórico - ahora incluye válvulas y sensores
      const datosHistorico = {
        valvulas: [1, 2].map(id => ({
          id,
          presion: datos[`valvula${id}_presion_interna`] || 0,
          estado: datos[`valvula${id}_estado`] || false
        })),
        sensores: [
          { id: 'sensor_pre_v1', presion: datos['sensor_pre_v1'] || 0 },
          { id: 'sensor_post_v1', presion: datos['sensor_post_v1'] || 0 },
          { id: 'sensor_pre_v2', presion: datos['sensor_pre_v2'] || 0 },
          { id: 'sensor_post_v2', presion: datos['sensor_post_v2'] || 0 },
        ]
      };

      agregarDatos(datosHistorico);

    } catch (error) {
      console.error("Error:", error);
    }
  }, [data, connected, agregarDatos]); // agregarDatos está memoizada, es seguro incluirla

  // Actualización de nodos para el nuevo sistema
  useEffect(() => {
    if (!data || !connected) return;

    try {
      const datos = JSON.parse(data);

      // Actualizar nodos de forma controlada
      setNodes((prevNodes) => {
        return prevNodes.map((node) => {
          // Actualizar tanques
          if (node.data.litrosKey && datos[node.data.litrosKey] !== node.data.litros) {
            return {
              ...node,
              data: {
                ...node.data,
                litros: datos[node.data.litrosKey] || 0
              }
            };
          }

          // Actualizar válvulas (identificadas por presionKey Y estadoKey)
          if (node.data.presionKey && node.data.estadoKey && node.type === 'valvula') {
            const nuevaPresion = datos[node.data.presionKey] || 0;
            const nuevoEstado = datos[node.data.estadoKey] || false;

            // Actualizar si hay cambios o si falta onToggle
            if (nuevaPresion !== node.data.presion || nuevoEstado !== node.data.estado || !node.data.onToggle) {
              return {
                ...node,
                data: {
                  ...node.data,
                  presion: nuevaPresion,
                  estado: nuevoEstado,
                  onToggle: handleValvulaToggle // Asegurar que siempre esté presente
                }
              };
            }
          }

          // Actualizar sensores de presión (solo presionKey, sin estadoKey)
          if (node.data.presionKey && !node.data.estadoKey && node.type === 'sensor') {
            const nuevaPresion = datos[node.data.presionKey] || 0;

            // Solo actualizar si hay cambios
            if (nuevaPresion !== node.data.presion) {
              return {
                ...node,
                data: {
                  ...node.data,
                  presion: nuevaPresion
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
