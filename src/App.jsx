import { useEffect, useCallback, useState } from 'react';
import { useDataHistory } from './hook/useDataHistory';
import { useMQTT } from './hook/useMQTT';
import { Tanque } from './components/tanque';
import { Valvula } from './components/valvula';
import { Sensor } from './components/sensor';
import { GraficasPanel } from './components/GraficasPanel';
import { ConnectionStatus } from './components/ConnectionStatus';
import { initialNodes } from './config/nodePositions';
import AlertaTomas from './components/AlertaTomas';
import ValvulasPanel from './components/ValvulasPanel';
import { PlusIcon } from 'lucide-react';
import { MinusIcon } from 'lucide-react';
import { RefreshCcwDotIcon } from 'lucide-react';
import { Button } from './components/ui/button';

const nodeComponents = {
  tanque: Tanque,
  valvula: Valvula,
  sensor: Sensor,
};

export default function App() {
  const [nodes, setNodes] = useState(initialNodes);
  const [lastDataTime, setLastDataTime] = useState(null);
  const [tomasActivas, setTomasActivas] = useState([]);
  const [showAlerta, setShowAlerta] = useState(false);
  const [simulandoFuga, setSimulandoFuga] = useState(false);
  const [imageScale, setImageScale] = useState(1);
  const [imagePosition, setImagePosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [highlightedValvula, setHighlightedValvula] = useState(null);

  const { historia, agregarDatos, getDatosGrafico, sessionStartTime, limpiarHistorial } = useDataHistory(60);
  const { data, connected, sendCommand } = useMQTT("ws://localhost:9001", "tanques/datos");

  // Usar getDatosGrafico directamente ya que está memoizado en el hook
  const datosGrafico = getDatosGrafico;

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

  // Función para simular alertas de fuga
  const handleSimularFuga = useCallback(() => {
    setSimulandoFuga(prev => !prev);
    if (!simulandoFuga) {
      // Simular alertas de fuga
      setTomasActivas([
        { nombre: 'Posible Fuga Detectada - Zona 1', flujo: 1.2 },
        { nombre: 'Posible Fuga Detectada - Zona 2', flujo: 0.8 }
      ]);
      setShowAlerta(true);
    } else {
      // Limpiar alertas
      setTomasActivas([]);
      setShowAlerta(false);
    }
  }, [simulandoFuga]);

  // INICIALIZAR NODOS DE VÁLVULAS Y TOMAS CON onToggle desde el inicio
  useEffect(() => {
    setNodes((prevNodes) => {
      return prevNodes.map((node) => {
        // Inicializar onToggle para válvulas
        if (node.type === 'valvula' && !node.data.onToggle) {
          return {
            ...node,
            data: {
              ...node.data,
              onToggle: handleValvulaToggle
            }
          };
        }
        // Tomas clandestinas removidas
        return node;
      });
    });
  }, [handleValvulaToggle]);

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
  }, [data, connected, agregarDatos]);

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
                  onToggle: handleValvulaToggle
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

          // Tomas clandestinas removidas

          return node;
        });
      });

      // Detección de tomas clandestinas removida - solo alertas simuladas

    } catch (error) {
      console.error("Error:", error);
    }
  }, [data, connected, handleValvulaToggle]);

  // Funciones para manejar la imagen
  const handleMouseDown = (e) => {
    setIsDragging(true);
    setDragStart({
      x: e.clientX - imagePosition.x,
      y: e.clientY - imagePosition.y
    });
  };

  const handleMouseMove = (e) => {
    if (isDragging) {
      setImagePosition({
        x: e.clientX - dragStart.x,
        y: e.clientY - dragStart.y
      });
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  // Funciones para el highlight de válvulas
  const handleValvulaHover = useCallback((valvulaId) => {
    setHighlightedValvula(valvulaId);
  }, []);

  const handleValvulaLeave = useCallback(() => {
    setHighlightedValvula(null);
  }, []);

  return (
    <div
      className="w-full h-screen flex bg-gray-100 overflow-hidden"
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
    >
      {/* Panel izquierdo para el viewport */}
      <div className="flex-1 relative bg-white border-r border-gray-300 overflow-hidden">
        {/* Viewport unificado que contiene tanto el fondo como los nodos */}
        <div
          className="absolute inset-0 cursor-move"
          onMouseDown={handleMouseDown}
          style={{
            transform: `translate(${imagePosition.x}px, ${imagePosition.y}px) scale(${imageScale})`,
            transformOrigin: '0 0',
            width: '2000px',
            height: '1500px'
          }}
        >
          {/* Imagen SCADA de fondo */}
          <div
            className="absolute inset-0"
            style={{
              backgroundImage: 'url("/src/assets/scada.png")',
              backgroundSize: '70%',
              backgroundRepeat: 'no-repeat',
              backgroundPosition: 'center top 50px left 40px'
            }}
          />

          {/* Nodos flotantes con posición absoluta dentro del viewport */}
          {nodes.map((node) => {
            const NodeComponent = nodeComponents[node.type];
            if (!NodeComponent) return null;

            // Renderizar diferentes tipos de nodos con sus props específicas
            let nodeContent;

            if (node.type === 'tanque') {
              nodeContent = (
                <NodeComponent
                  litros={node.data.litros || 0}
                  capacidad={node.data.capacidad || 1000}
                />
              );
            } else if (node.type === 'valvula') {
              const isHighlighted = highlightedValvula === node.id;
              nodeContent = (
                <div
                  className={`transition-all duration-200 ${isHighlighted && 'ring-2 ring-blue-400 ring-opacity-75 rounded-lg scale-110 ring-offset-4'
                    }`}
                >
                  <NodeComponent
                    id={node.data.id}
                    estado={node.data.estado || false}
                    onToggle={node.data.onToggle}
                  />
                </div>
              );
            } else if (node.type === 'sensor') {
              nodeContent = (
                <NodeComponent
                  presion={node.data.presion || 0}
                  label={node.data.label || "Sensor"}
                  tipo={node.data.tipo || "entrada"}
                />
              );
            }

            return (
              <div
                key={node.id}
                className="absolute z-10"
                style={{
                  left: `${node.position.x}px`,
                  top: `${node.position.y}px`
                }}
              >
                {nodeContent}
              </div>
            );
          })}
        </div>
      </div>

      {/* Panel derecho fijo para las gráficas */}
      <div className="w-[420px] bg-gray-50 border-l border-gray-300 flex flex-col">
        <GraficasPanel
          datosGrafico={datosGrafico}
          historia={historia}
          connected={connected}
          sessionStartTime={sessionStartTime}
          onLimpiarHistorial={limpiarHistorial}
        />
      </div>

      <ConnectionStatus connected={connected} lastDataTime={lastDataTime} />

      {showAlerta && (
        <AlertaTomas tomasActivas={tomasActivas} />
      )}

      <div className="absolute bottom-44 left-4 z-20 flex flex-col gap-2">
        <Button
          variant="outline"
          size="icon"
          onClick={() => setImageScale(prev => Math.min(3, prev * 1.2))}
        >
          <PlusIcon />
        </Button>
        <Button
          variant="outline"
          size="icon"
          onClick={() => setImageScale(prev => Math.max(0.1, prev * 0.8))}
        >
          <MinusIcon />
        </Button>
        <Button
          variant="outline"
          size="icon"
          onClick={() => {
            setImageScale(1);
            setImagePosition({ x: 0, y: 0 });
          }}
        >
          <RefreshCcwDotIcon />
        </Button>
      </div>

      {/* Botón de simulación de fugas en la esquina inferior derecha */}
      <div className="absolute bottom-44 right-[440px] z-20">
        <button
          onClick={handleSimularFuga}
          className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 ${simulandoFuga
            ? 'bg-red-500 text-white hover:bg-red-600 shadow-lg'
            : 'bg-orange-500 text-white hover:bg-orange-600 shadow-md'
            }`}
        >
          {simulandoFuga ? '🛑 Detener Simulación' : '⚠️ Simular Fuga'}
        </button>
      </div>

      <ValvulasPanel
        nodes={nodes}
        onValvulaToggle={handleValvulaToggle}
        onValvulaHover={handleValvulaHover}
        onValvulaLeave={handleValvulaLeave}
      />
    </div>
  );
}
