/**
 * Hook personalizado para el simulador de tanques en JavaScript puro
 * Reemplaza la funcionalidad MQTT con simulación local
 */

import { useState, useEffect, useRef, useCallback } from 'react';
import { TankSimulator } from '../simulator/TankSimulator.js';

export const useSimulator = () => {
  const [isConnected, setIsConnected] = useState(false);
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);
  const simulatorRef = useRef(null);
  const [isInitialized, setIsInitialized] = useState(false);

  // Inicializar simulador
  useEffect(() => {
    try {
      // Crear instancia del simulador
      simulatorRef.current = new TankSimulator();

      // Configurar callbacks optimizados
      simulatorRef.current.onDataUpdate = (newData) => {
        // Solo actualizar si hay cambios significativos
        setData(prevData => {
          if (!prevData) return newData;

          // Comparar cambios importantes para evitar re-renders innecesarios
          const hasSignificantChange =
            Math.abs((newData.timestamp || 0) - (prevData.timestamp || 0)) > 100 ||
            JSON.stringify(newData.tanques) !== JSON.stringify(prevData.tanques) ||
            JSON.stringify(newData.valvulas) !== JSON.stringify(prevData.valvulas) ||
            JSON.stringify(newData.sensores) !== JSON.stringify(prevData.sensores);

          return hasSignificantChange ? newData : prevData;
        });
      };

      simulatorRef.current.onStateChange = (stateChange) => {
        console.log('Estado del simulador cambió:', stateChange);
      };

      // Iniciar simulación
      simulatorRef.current.iniciar();

      // Asegurar que el simulador no esté pausado
      if (simulatorRef.current.pausado) {
        simulatorRef.current.togglePausa();
        console.log('🔄 Simulador despausado automáticamente');
      }

      // Marcar como conectado e inicializado
      setIsConnected(true);
      setIsInitialized(true);
      setError(null);

      // Obtener datos iniciales
      setData(simulatorRef.current.getDatos());

      console.log('✅ Simulador JavaScript iniciado correctamente y funcionando');

    } catch (err) {
      console.error('❌ Error al inicializar simulador:', err);
      setError(err.message);
      setIsConnected(false);
    }

    // Cleanup al desmontar
    return () => {
      if (simulatorRef.current) {
        simulatorRef.current.destroy();
        simulatorRef.current = null;
      }
      setIsConnected(false);
      setIsInitialized(false);
    };
  }, []);

  // Función para enviar comandos al simulador
  const sendCommand = useCallback((command) => {
    if (!simulatorRef.current || !isInitialized) {
      console.warn('Simulador no inicializado');
      return;
    }

    try {
      console.log('📤 Enviando comando:', command);

      // Procesar diferentes tipos de comandos
      if (command.tipo === 'valvula') {
        // Nuevo formato: {"tipo": "valvula", "id": N, "estado": boolean}
        const valvulaId = `v${command.id}`;
        const estadoActual = simulatorRef.current.valvulas[valvulaId]?.abierta;

        if (estadoActual !== command.estado) {
          simulatorRef.current.toggleValvula(valvulaId);
        }
      } else if (command.comando) {
        // Formato legacy y otros comandos
        switch (command.comando) {
          case 'valvula1':
            if (simulatorRef.current.valvulas.v1.abierta !== command.valor) {
              simulatorRef.current.toggleValvula('v1');
            }
            break;
          case 'valvula2':
            if (simulatorRef.current.valvulas.v2.abierta !== command.valor) {
              simulatorRef.current.toggleValvula('v2');
            }
            break;
          case 'valvula3':
            if (simulatorRef.current.valvulas.v3.abierta !== command.valor) {
              simulatorRef.current.toggleValvula('v3');
            }
            break;
          case 'valvula4':
            if (simulatorRef.current.valvulas.v4.abierta !== command.valor) {
              simulatorRef.current.toggleValvula('v4');
            }
            break;
          case 'valvula5':
            if (simulatorRef.current.valvulas.v5.abierta !== command.valor) {
              simulatorRef.current.toggleValvula('v5');
            }
            break;
          case 'valvula6':
            if (simulatorRef.current.valvulas.v6.abierta !== command.valor) {
              simulatorRef.current.toggleValvula('v6');
            }
            break;
          case 'pausar':
            simulatorRef.current.togglePausa();
            break;
          case 'reset':
            simulatorRef.current.reset();
            break;
          case 'fuga':
            if (command.tanque && command.intensidad) {
              simulatorRef.current.simularFuga(command.tanque, command.intensidad);
            }
            break;
          case 'detener_fuga':
            simulatorRef.current.detenerFuga();
            break;
          default:
            console.warn('Comando no reconocido:', command.comando);
        }
      }

      // Los datos se actualizarán automáticamente en el próximo ciclo del simulador

    } catch (err) {
      console.error('❌ Error al procesar comando:', err);
      setError(err.message);
    }
  }, [isInitialized]);

  // Función para obtener datos actuales
  const getCurrentData = useCallback(() => {
    if (!simulatorRef.current || !isInitialized) {
      return null;
    }
    return simulatorRef.current.getDatos();
  }, [isInitialized]);

  // Función para pausar/reanudar
  const togglePause = useCallback(() => {
    sendCommand({ comando: 'pausar' });
  }, [sendCommand]);

  // Función para resetear sistema
  const resetSystem = useCallback(() => {
    sendCommand({ comando: 'reset' });
  }, [sendCommand]);

  // Función para simular fuga
  const simulateLeak = useCallback((tanque, intensidad = 5) => {
    sendCommand({
      comando: 'fuga',
      tanque: tanque,
      intensidad: intensidad
    });
  }, [sendCommand]);

  // Función para detener fuga
  const stopLeak = useCallback(() => {
    sendCommand({ comando: 'detener_fuga' });
  }, [sendCommand]);

  // Función para controlar válvulas individualmente
  const toggleValve = useCallback((valveId, estado = null) => {
    if (estado !== null) {
      // Establecer estado específico
      const valvulaNum = valveId.replace('v', '');
      sendCommand({
        tipo: 'valvula',
        id: parseInt(valvulaNum),
        estado: estado
      });
    } else {
      // Toggle estado actual
      simulatorRef.current?.toggleValvula(valveId);
      // Los datos se actualizarán automáticamente en el próximo ciclo
    }
  }, [sendCommand]);

  // Estado del simulador
  const simulatorStatus = {
    isConnected,
    isInitialized,
    isPaused: data?.pausado ?? true,
    hasLeak: data?.fuga?.activa ?? false,
    error
  };

  return {
    // Estados
    isConnected,
    data,
    error,
    simulatorStatus,

    // Funciones principales
    sendCommand,
    getCurrentData,

    // Funciones de control
    togglePause,
    resetSystem,
    simulateLeak,
    stopLeak,
    toggleValve,

    // Compatibilidad con la API anterior
    connected: isConnected,
    mqttData: data
  };
};

export default useSimulator;