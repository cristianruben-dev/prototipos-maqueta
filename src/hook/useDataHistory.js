import { useState, useEffect } from 'react';

export function useDataHistory(maxMinutes = 15) {
  const [historia, setHistoria] = useState({
    valvula1: [],
    valvula2: [],
    valvula3: [],
    flujo: []
  });

  // Cargar datos del localStorage al inicializar
  useEffect(() => {
    const datosGuardados = localStorage.getItem('valvulas_historial');
    if (datosGuardados) {
      const datos = JSON.parse(datosGuardados);
      setHistoria(datos);
    }
  }, []);

  // Guardar en localStorage cuando cambie la historia
  useEffect(() => {
    localStorage.setItem('valvulas_historial', JSON.stringify(historia));
  }, [historia]);

  // Función para agregar nuevos datos
  function agregarDatos(valvulas, flujo) {
    const timestamp = Date.now();
    const maxPuntos = 30; // Máximo 30 puntos para mantener los gráficos limpios
    const maxTiempo = maxMinutes * 60 * 1000;
    const tiempoLimite = timestamp - maxTiempo;

    setHistoria(prev => {
      // Crear nuevo objeto con los datos actualizados
      const nuevo = {
        valvula1: [
          ...prev.valvula1, 
          { time: timestamp, value: valvulas[0]?.presion || 0 }
        ].slice(-maxPuntos),
        valvula2: [
          ...prev.valvula2, 
          { time: timestamp, value: valvulas[1]?.presion || 0 }
        ].slice(-maxPuntos),
        valvula3: [
          ...prev.valvula3, 
          { time: timestamp, value: valvulas[2]?.presion || 0 }
        ].slice(-maxPuntos),
        flujo: [
          ...prev.flujo,
          { time: timestamp, value: flujo || 0 }
        ].slice(-maxPuntos)
      };

      // Filtrar datos viejos
      nuevo.valvula1 = nuevo.valvula1.filter(item => item.time > tiempoLimite);
      nuevo.valvula2 = nuevo.valvula2.filter(item => item.time > tiempoLimite);
      nuevo.valvula3 = nuevo.valvula3.filter(item => item.time > tiempoLimite);
      nuevo.flujo = nuevo.flujo.filter(item => item.time > tiempoLimite);

      return nuevo;
    });
  }

  // Formatear datos para los gráficos de Recharts
  function getDatosGrafico() {
    // Convertir el formato de datos para ser compatible con Recharts
    return {
      valvula1: historia.valvula1.map(item => ({
        time: new Date(item.time).toLocaleTimeString(),
        presion: item.value
      })),
      valvula2: historia.valvula2.map(item => ({
        time: new Date(item.time).toLocaleTimeString(),
        presion: item.value
      })),
      valvula3: historia.valvula3.map(item => ({
        time: new Date(item.time).toLocaleTimeString(),
        presion: item.value
      })),
      flujo: historia.flujo.map(item => ({
        time: new Date(item.time).toLocaleTimeString(),
        flujo: item.value
      }))
    };
  }

  return { historia, agregarDatos, getDatosGrafico };
}