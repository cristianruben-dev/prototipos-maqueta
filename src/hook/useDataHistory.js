import { useState, useEffect, useCallback } from 'react';

export function useDataHistory(maxMinutes = 15) {
  const [historia, setHistoria] = useState({
    principal: [],
    tanque1: [],
    tanque2: []
  });

  // Cargar datos del localStorage al inicializar
  useEffect(() => {
    try {
      const datosGuardados = localStorage.getItem('tanques_historial');
      if (datosGuardados) {
        const datos = JSON.parse(datosGuardados);
        setHistoria(datos);
      }
    } catch (error) {
      console.error('Error cargando historial:', error);
    }
  }, []);

  // Guardar en localStorage cuando cambie la historia
  useEffect(() => {
    localStorage.setItem('tanques_historial', JSON.stringify(historia));
  }, [historia]);

  // Función para agregar nuevos datos
  const agregarDatos = useCallback((principal, tanque1, tanque2) => {
    const timestamp = Date.now();

    setHistoria(prev => {
      const maxPuntos = 50; // Máximo 50 puntos
      const maxTiempo = maxMinutes * 60 * 1000;
      const tiempoLimite = timestamp - maxTiempo;

      const nuevo = {
        principal: [...prev.principal, { time: timestamp, value: principal.presion }].slice(-maxPuntos),
        tanque1: [...prev.tanque1, { time: timestamp, value: tanque1.presion }].slice(-maxPuntos),
        tanque2: [...prev.tanque2, { time: timestamp, value: tanque2.presion }].slice(-maxPuntos)
      };

      // Filtrar datos viejos
      nuevo.principal = nuevo.principal.filter(item => item.time > tiempoLimite);
      nuevo.tanque1 = nuevo.tanque1.filter(item => item.time > tiempoLimite);
      nuevo.tanque2 = nuevo.tanque2.filter(item => item.time > tiempoLimite);

      return nuevo;
    });
  }, [maxMinutes]);

  return { historia, agregarDatos };
}