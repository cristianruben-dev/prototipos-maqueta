import { useState, useEffect, useCallback, useMemo } from 'react';

export function useDataHistory(maxMinutes = 15) {
  const [historia, setHistoria] = useState({
    sensor_pre_v1: [],
    sensor_post_v1: [],
    sensor_pre_v2: [],
    sensor_post_v2: []
  });
  const [sessionStartTime, setSessionStartTime] = useState(null);

  useEffect(() => {
    const datosGuardados = localStorage.getItem('valvulas_historial');
    const sessionStart = localStorage.getItem('session_start_time');

    if (datosGuardados) {
      try {
        const datosParseados = JSON.parse(datosGuardados);
        // Migrar datos viejos al nuevo formato - Solo sensores
        const datosNormalizados = {
          sensor_pre_v1: datosParseados.sensor_pre_v1 || [],
          sensor_post_v1: datosParseados.sensor_post_v1 || [],
          sensor_pre_v2: datosParseados.sensor_pre_v2 || [],
          sensor_post_v2: datosParseados.sensor_post_v2 || []
        };
        setHistoria(datosNormalizados);
      } catch (error) {
        console.warn('Error cargando historial, usando datos vacíos:', error);
        // Si hay error, usar datos vacíos
        setHistoria({
          sensor_pre_v1: [],
          sensor_post_v1: [],
          sensor_pre_v2: [],
          sensor_post_v2: []
        });
      }
    }

    if (sessionStart) {
      setSessionStartTime(new Date(sessionStart));
    } else {
      const now = new Date();
      setSessionStartTime(now);
      localStorage.setItem('session_start_time', now.toISOString());
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('valvulas_historial', JSON.stringify(historia));
  }, [historia]);

  // Helper para actualizar una serie de datos - MEMOIZADO
  const actualizarSerie = useCallback((seriePrev, nuevoValor) => {
    const maxPuntos = 2000;
    const maxTiempo = maxMinutes * 60 * 1000;
    const timestamp = Date.now();
    const tiempoLimite = timestamp - maxTiempo;

    // Primero filtrar por tiempo, luego por cantidad si es necesario
    const datosFiltradosPorTiempo = [...seriePrev, { time: timestamp, value: nuevoValor }]
      .filter(item => item.time > tiempoLimite);

    // Si después del filtro por tiempo aún hay demasiados puntos, mantener los más recientes
    return datosFiltradosPorTiempo.slice(-maxPuntos);
  }, [maxMinutes]);

  const agregarDatos = useCallback((datosEntrada) => {
    // Solo manejar sensores: { sensores: [...] }
    setHistoria(prev => {
      const nuevaHistoria = { ...prev };

      // Actualizar solo sensores
      if (datosEntrada.sensores) {
        datosEntrada.sensores.forEach(sensor => {
          if (nuevaHistoria[sensor.id]) {
            nuevaHistoria[sensor.id] = actualizarSerie(nuevaHistoria[sensor.id], sensor.presion || 0);
          }
        });
      }

      return nuevaHistoria;
    });
  }, [actualizarSerie]);

  const formatearDatos = useCallback((datos, dataKey) => {
    if (!datos || !Array.isArray(datos)) {
      return [];
    }
    return datos.map(item => ({
      time: new Date(item.time).toLocaleTimeString('es-ES', {
        hour12: false,
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
      }),
      [dataKey]: item.value
    }));
  }, []);

  const getDatosGrafico = useMemo(() => {
    return {
      sensor_pre_v1: formatearDatos(historia.sensor_pre_v1, 'presion'),
      sensor_post_v1: formatearDatos(historia.sensor_post_v1, 'presion'),
      sensor_pre_v2: formatearDatos(historia.sensor_pre_v2, 'presion'),
      sensor_post_v2: formatearDatos(historia.sensor_post_v2, 'presion')
    };
  }, [historia, formatearDatos]);

  // Función para limpiar historial - MEMOIZADA
  const limpiarHistorial = useCallback(() => {
    setHistoria({
      sensor_pre_v1: [],
      sensor_post_v1: [],
      sensor_pre_v2: [],
      sensor_post_v2: []
    });
    const now = new Date();
    setSessionStartTime(now);
    localStorage.setItem('session_start_time', now.toISOString());
    localStorage.removeItem('valvulas_historial');
  }, []);

  return { historia, agregarDatos, getDatosGrafico, sessionStartTime, limpiarHistorial };
}