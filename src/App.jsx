import { useEffect, useCallback, useState } from 'react';
import { useDataHistory } from './hook/useDataHistory';
import useSimulator from './hook/useSimulator';
import { Tanque } from './components/tanque';
import { Valvula } from './components/valvula';
import { Sensor } from './components/sensor';
import Fuga from './components/fuga';
import { GraficasPanel } from './components/GraficasPanel';
import { ConnectionStatus } from './components/ConnectionStatus';
import { initialNodes } from './config/nodePositions';
import AlertaTomas from './components/AlertaTomas';
import FugaOverlay from './components/FugaOverlay';
import ValvulasPanel from './components/ValvulasPanel';
import { PlusIcon } from 'lucide-react';
import { MinusIcon } from 'lucide-react';
import { RefreshCcwDotIcon } from 'lucide-react';
import { Button } from './components/ui/button';
import useFugaStore from './stores/fugaStore';
import scadaImage from './assets/scada.png';

const nodeComponents = {
  tanque: Tanque,
  valvula: Valvula,
  sensor: Sensor,
  fuga: Fuga,
};

// Componente interno que usa el contexto de fuga
function AppContent() {
  const [nodes, setNodes] = useState(initialNodes);
  const [lastDataTime, setLastDataTime] = useState(null);
  const [tomasActivas, setTomasActivas] = useState([]);
  const [showAlerta, setShowAlerta] = useState(false);
  const [showFugaOverlay, setShowFugaOverlay] = useState(false);
  
  // Usar el store de fuga
  const { fugaActiva, activarFuga, desactivarFuga, toggleFuga } = useFugaStore();
  const [imageScale, setImageScale] = useState(1);
  const [imagePosition, setImagePosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [highlightedValvula, setHighlightedValvula] = useState(null);

  const { historia, agregarDatos, getDatosGrafico, sessionStartTime, limpiarHistorial } = useDataHistory(60);
  const { isConnected: connected, data: mqttData, sendCommand } = useSimulator();

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
      sendCommand(comando);
    }
  }, [sendCommand]);

  // Función para simular alertas de fuga usando el contexto
  const handleSimularFuga = useCallback(() => {
    if (!fugaActiva) {
      // Activar fuga
      activarFuga();
      
      // Configurar información de la fuga (solo un tramo)
      const fugaData = {
        nombre: 'Fuga Detectada - Tramo Principal',
        flujo: 2.5,
        intensidad: 'ALTA',
        zona: 'Sistema Principal'
      };

      setShowFugaOverlay(true);

      // Configurar alerta pequeña para después del overlay
      setTomasActivas([fugaData]);

      // Hacer visible el nodo de fuga
      setNodes(prevNodes =>
        prevNodes.map(node =>
          node.id === 'indicador-fuga'
            ? { ...node, data: { ...node.data, visible: true } }
            : node
        )
      );
    } else {
      // Desactivar fuga
      desactivarFuga();
      
      // Limpiar alertas
      setTomasActivas([]);
      setShowAlerta(false);
      setShowFugaOverlay(false);

      // Ocultar el nodo de fuga
      setNodes(prevNodes =>
        prevNodes.map(node =>
          node.id === 'indicador-fuga'
            ? { ...node, data: { ...node.data, visible: false } }
            : node
        )
      );
    }
  }, [fugaActiva, activarFuga, desactivarFuga]);

  // Función para cerrar el overlay de fuga
  const handleCloseFugaOverlay = useCallback(() => {
    setShowFugaOverlay(false);
    setShowAlerta(true); // Mostrar la alerta pequeña después de cerrar el overlay
  }, []);

  // Función para resetear la simulación
  const handleResetSimulation = useCallback(() => {
    // Limpiar las alertas de fuga usando el contexto
    desactivarFuga();
    setTomasActivas([]);
    setShowAlerta(false);
    setShowFugaOverlay(false);

    // Ocultar el nodo de fuga
    setNodes(prevNodes =>
      prevNodes.map(node =>
        node.id === 'indicador-fuga'
          ? { ...node, data: { ...node.data, visible: false } }
          : node
      )
    );
  }, [desactivarFuga]);

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

  // Actualización de nodos para el nuevo sistema (optimizado para histórico)
  useEffect(() => {
    if (!mqttData || !connected) return;

    try {
      // Los datos del simulador ya vienen como objeto, no necesitan parsing
      const datos = mqttData;

      // Actualizar timestamp de últimos datos
      setLastDataTime(Date.now());

      // Preparar datos para histórico - ahora incluye válvulas y sensores
      // Convertir presiones de kPa a PSI para las gráficas (1 kPa = 0.145038 PSI)
      const datosHistorico = {
        valvulas: [1, 2].map(id => ({
          id,
          presion: datos.valvulas?.[`v${id}`]?.presion_entrada || 0,
          estado: datos.valvulas?.[`v${id}`]?.abierta || false
        })),
        sensores: [
          { id: 'sensor_pre_v1', presion: (datos.sensores?.pre_v1 || 0) * 0.145038 },
          { id: 'sensor_post_v1', presion: (datos.sensores?.post_v1 || 0) * 0.145038 },
          { id: 'sensor_pre_v2', presion: (datos.sensores?.pre_v2 || 0) * 0.145038 },
          { id: 'sensor_post_v2', presion: (datos.sensores?.post_v2 || 0) * 0.145038 },
        ]
      };

      agregarDatos(datosHistorico);

    } catch (error) {
      console.error("Error:", error);
    }
  }, [mqttData, connected, agregarDatos]);

  // Actualización de nodos para el nuevo sistema (optimizado con threshold)
  useEffect(() => {
    if (!mqttData || !connected) return;

    try {
      // Los datos del simulador ya vienen como objeto
      const datos = mqttData;

      // Actualizar nodos de forma controlada con verificación de cambios
      setNodes((prevNodes) => {
        let hasChanges = false;
        const newNodes = prevNodes.map((node) => {
          // Actualizar tanques
          if (node.data.litrosKey && node.type === 'tanque') {
            let nuevosLitros = 0;

            // Mapear las claves del simulador a las claves de los nodos
            if (node.data.litrosKey === 'tanque_izq1_litros') {
              nuevosLitros = datos.tanques?.izq1?.nivel || 0;
            } else if (node.data.litrosKey === 'tanque_izq2_litros') {
              nuevosLitros = datos.tanques?.izq2?.nivel || 0;
            } else if (node.data.litrosKey === 'tanque_der1_litros') {
              nuevosLitros = datos.tanques?.der1?.nivel || 0;
            } else if (node.data.litrosKey === 'tanque_der2_litros') {
              nuevosLitros = datos.tanques?.der2?.nivel || 0;
            }

            // Solo actualizar si hay cambios significativos (threshold de 1 litro)
            if (Math.abs(nuevosLitros - (node.data.litros || 0)) > 1) {
              hasChanges = true;
              return {
                ...node,
                data: {
                  ...node.data,
                  litros: nuevosLitros,
                  porcentaje: (nuevosLitros / node.data.capacidad) * 100
                }
              };
            }
          }

          // Actualizar válvulas (identificadas por presionKey Y estadoKey)
          if (node.data.presionKey && node.data.estadoKey && node.type === 'valvula') {
            let nuevaPresion = 0;
            let nuevoEstado = false;

            // Mapear las claves del simulador
            if (node.data.presionKey === 'valvula1_presion_interna') {
              nuevaPresion = datos.valvulas?.v1?.presion_entrada || 0;
              nuevoEstado = datos.valvulas?.v1?.abierta || false;
            } else if (node.data.presionKey === 'valvula2_presion_interna') {
              nuevaPresion = datos.valvulas?.v2?.presion_entrada || 0;
              nuevoEstado = datos.valvulas?.v2?.abierta || false;
            } else if (node.data.presionKey === 'valvula_tanque_izq_1_presion') {
              nuevaPresion = datos.valvulas?.v3?.presion_entrada || 0;
              nuevoEstado = datos.valvulas?.v3?.abierta || false;
            } else if (node.data.presionKey === 'valvula_tanque_izq_2_presion') {
              nuevaPresion = datos.valvulas?.v4?.presion_entrada || 0;
              nuevoEstado = datos.valvulas?.v4?.abierta || false;
            } else if (node.data.presionKey === 'valvula_tanque_der_1_presion') {
              nuevaPresion = datos.valvulas?.v5?.presion_entrada || 0;
              nuevoEstado = datos.valvulas?.v5?.abierta || false;
            } else if (node.data.presionKey === 'valvula_tanque_der_2_presion') {
              nuevaPresion = datos.valvulas?.v6?.presion_entrada || 0;
              nuevoEstado = datos.valvulas?.v6?.abierta || false;
            }

            // Aplicar efecto visual de fuga si está activa
            const fugaActiva = window.fugaGlobal?.activa === true;
            if (fugaActiva && (node.data.presionKey === 'valvula2_presion_interna' || node.data.presionKey === 'valvula1_presion_interna')) {
              console.log('🔴 Aplicando efecto visual de fuga en válvula:', node.data.presionKey, 'presión original:', nuevaPresion);
              nuevaPresion = nuevaPresion * 0.5; // Reducir a la mitad para efecto visual
              console.log('🔴 Presión con efecto de fuga en válvula:', nuevaPresion);
            }

            // Actualizar si hay cambios significativos o si falta onToggle
            const presionChanged = Math.abs((node.data.presion || 0) - nuevaPresion) > 0.1;
            const estadoChanged = nuevoEstado !== node.data.estado;

            if (presionChanged || estadoChanged || !node.data.onToggle) {
              hasChanges = true;
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
            let nuevaPresion = 0;

            // Mapear las claves del simulador
            if (node.data.presionKey === 'sensor_pre_v1') {
              nuevaPresion = datos.sensores?.pre_v1 || 0;
            } else if (node.data.presionKey === 'sensor_post_v1') {
              nuevaPresion = datos.sensores?.post_v1 || 0;
            } else if (node.data.presionKey === 'sensor_pre_v2') {
              nuevaPresion = datos.sensores?.pre_v2 || 0;
            } else if (node.data.presionKey === 'sensor_post_v2') {
              nuevaPresion = datos.sensores?.post_v2 || 0;
            }

            // Aplicar efecto visual de fuga si está activa
            const fugaActiva = window.fugaGlobal?.activa === true;
            if (fugaActiva && (node.data.presionKey === 'sensor_pre_v2' || node.data.presionKey === 'sensor_post_v2')) {
              console.log('🔴 Aplicando efecto visual de fuga en sensor:', node.data.presionKey, 'presión original:', nuevaPresion);
              nuevaPresion = nuevaPresion * 0.5; // Reducir a la mitad para efecto visual
              console.log('🔴 Presión con efecto de fuga en sensor:', nuevaPresion);
            }

            // Solo actualizar si hay cambios significativos (threshold de 0.1)
            if (Math.abs((node.data.presion || 0) - nuevaPresion) > 0.1) {
              hasChanges = true;
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

        // Solo actualizar si realmente hay cambios
        return hasChanges ? newNodes : prevNodes;
      });

    } catch (error) {
      console.error("Error:", error);
    }
  }, [mqttData, connected, handleValvulaToggle]);

  // Funciones para manejar la imagen (optimizadas con useCallback)
  const handleMouseDown = useCallback((e) => {
    setIsDragging(true);
    setDragStart({
      x: e.clientX - imagePosition.x,
      y: e.clientY - imagePosition.y
    });
  }, [imagePosition.x, imagePosition.y]);

  const handleMouseMove = useCallback((e) => {
    if (isDragging) {
      setImagePosition({
        x: e.clientX - dragStart.x,
        y: e.clientY - dragStart.y
      });
    }
  }, [isDragging, dragStart.x, dragStart.y]);

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
  }, []);

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
              backgroundImage: `url(${scadaImage})`,
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
            } else if (node.type === 'fuga') {
              nodeContent = (
                <NodeComponent
                  data={node.data}
                />
              );
            }

            return (
              <div
                key={node.id}
                className="absolute z-10"
                style={{
                  left: `${node.position.x}px`,
                  top: `${node.position.y}px`,
                  willChange: 'transform'
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

      {/* Botones de simulación en la esquina inferior derecha */}
      <div className="absolute bottom-44 right-[440px] z-20 flex flex-col gap-2">
        <button
          onClick={handleSimularFuga}
          className={`px-3 py-1.5 rounded-md text-sm font-medium transition-all duration-200 opacity-5 ${fugaActiva
              ? 'bg-red-300 text-white hover:bg-red-600 shadow-md'
              : 'bg-orange-300 text-white hover:bg-orange-600 shadow-sm'
            }`}
        >
          {fugaActiva ? '🛑 Detener' : '⚠️ Simular Fuga'}
        </button>

        <button
          onClick={handleResetSimulation}
          className="px-3 py-1.5 rounded-md text-sm font-medium transition-all duration-200 opacity-[2%]
            bg-blue-500 text-white hover:bg-blue-600 shadow-sm"
        >
          🔄 Reset
        </button>
      </div>

      <ValvulasPanel
        nodes={nodes}
        onValvulaToggle={handleValvulaToggle}
        onValvulaHover={handleValvulaHover}
        onValvulaLeave={handleValvulaLeave}
      />

      {/* Overlay de fuga llamativo */}
      <FugaOverlay
        isVisible={showFugaOverlay}
        onClose={handleCloseFugaOverlay}
      />
    </div>
  );
}

// Componente principal
export default function App() {
  return <AppContent />;
}
