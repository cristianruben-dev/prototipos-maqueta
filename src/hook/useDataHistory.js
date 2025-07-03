import { useState, useEffect } from 'react';

export function useDataHistory(maxMinutes = 15) {
  const [historia, setHistoria] = useState({
    valvula1: [],
    valvula2: [],
    valvula3: []
  });
  const [sessionStartTime, setSessionStartTime] = useState(null);

  useEffect(() => {
    const datosGuardados = localStorage.getItem('valvulas_historial');
    const sessionStart = localStorage.getItem('session_start_time');

    if (datosGuardados) {
      setHistoria(JSON.parse(datosGuardados));
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

  // Helper para actualizar una serie de datos
  const actualizarSerie = (seriePrev, nuevoValor) => {
    const maxPuntos = 2000;
    const maxTiempo = maxMinutes * 60 * 1000;
    const timestamp = Date.now();
    const tiempoLimite = timestamp - maxTiempo;

    // Primero filtrar por tiempo, luego por cantidad si es necesario
    const datosFiltradosPorTiempo = [...seriePrev, { time: timestamp, value: nuevoValor }]
      .filter(item => item.time > tiempoLimite);

    // Si después del filtro por tiempo aún hay demasiados puntos, mantener los más recientes
    return datosFiltradosPorTiempo.slice(-maxPuntos);
  };

  function agregarDatos(valvulas) {
    setHistoria(prev => ({
      valvula1: actualizarSerie(prev.valvula1, valvulas[0]?.presion || 0),
      valvula2: actualizarSerie(prev.valvula2, valvulas[1]?.presion || 0),
      valvula3: actualizarSerie(prev.valvula3, valvulas[2]?.presion || 0)
    }));
  }

  const formatearDatos = (datos, dataKey) =>
    datos.map(item => ({
      time: new Date(item.time).toLocaleTimeString('es-ES', {
        hour12: false,
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
      }),
      [dataKey]: item.value
    }));

  function getDatosGrafico() {
    return {
      valvula1: formatearDatos(historia.valvula1, 'presion'),
      valvula2: formatearDatos(historia.valvula2, 'presion'),
      valvula3: formatearDatos(historia.valvula3, 'presion')
    };
  }

  // Función para limpiar historial
  function limpiarHistorial() {
    setHistoria({
      valvula1: [],
      valvula2: [],
      valvula3: []
    });
    const now = new Date();
    setSessionStartTime(now);
    localStorage.setItem('session_start_time', now.toISOString());
    localStorage.removeItem('valvulas_historial');
  }

  return { historia, agregarDatos, getDatosGrafico, sessionStartTime, limpiarHistorial };
}