import { useState, useEffect } from 'react';

export function useDataHistory(maxMinutes = 15) {
  const [historia, setHistoria] = useState({
    valvula1: [],
    valvula2: [],
    valvula3: [],
    flujo: []
  });

  // Cargar y guardar datos del localStorage
  useEffect(() => {
    const datosGuardados = localStorage.getItem('valvulas_historial');
    if (datosGuardados) {
      setHistoria(JSON.parse(datosGuardados));
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('valvulas_historial', JSON.stringify(historia));
  }, [historia]);

  // Helper para actualizar una serie de datos
  const actualizarSerie = (seriePrev, nuevoValor) => {
    const maxPuntos = 30;
    const maxTiempo = maxMinutes * 60 * 1000;
    const timestamp = Date.now();
    const tiempoLimite = timestamp - maxTiempo;

    return [...seriePrev, { time: timestamp, value: nuevoValor }]
      .slice(-maxPuntos)
      .filter(item => item.time > tiempoLimite);
  };

  // Función para agregar nuevos datos
  function agregarDatos(valvulas, flujo) {
    setHistoria(prev => ({
      valvula1: actualizarSerie(prev.valvula1, valvulas[0]?.presion || 0),
      valvula2: actualizarSerie(prev.valvula2, valvulas[1]?.presion || 0),
      valvula3: actualizarSerie(prev.valvula3, valvulas[2]?.presion || 0),
      flujo: actualizarSerie(prev.flujo, flujo || 0)
    }));
  }

  // Helper para formatear datos de tiempo
  const formatearDatos = (datos, dataKey) =>
    datos.map(item => ({
      time: new Date(item.time).toLocaleTimeString(),
      [dataKey]: item.value
    }));

  // Formatear datos para los gráficos
  function getDatosGrafico() {
    return {
      valvula1: formatearDatos(historia.valvula1, 'presion'),
      valvula2: formatearDatos(historia.valvula2, 'presion'),
      valvula3: formatearDatos(historia.valvula3, 'presion'),
      flujo: formatearDatos(historia.flujo, 'flujo')
    };
  }

  return { historia, agregarDatos, getDatosGrafico };
}