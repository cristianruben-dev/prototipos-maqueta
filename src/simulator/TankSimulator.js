/**
 * Simulador de Sistema de Tanques en JavaScript Puro
 * Replica toda la lógica del simulador MQTT Python sin dependencias externas
 */

class Tanque {
  constructor(id, capacidad = 1000, nivel_inicial = 0) {
    this.id = id;
    this.capacidad = capacidad;
    this.nivel_actual = nivel_inicial;
    this.flujo_entrada = 0;
    this.flujo_salida = 0;
    this.presion = Math.max(0, (nivel_inicial / capacidad) * 25 + 5); // Aumentar presión base para mejor visibilidad
    this.temperatura = 20 + Math.random() * 5; // 20-25°C
  }

  actualizar(dt) {
    // Actualizar nivel basado en flujos
    const cambio_nivel = (this.flujo_entrada - this.flujo_salida) * dt;
    this.nivel_actual = Math.max(0, Math.min(this.capacidad, this.nivel_actual + cambio_nivel));
    
    // Calcular presión basada en altura del líquido (P = ρgh)
    this.presion = Math.max(0, (this.nivel_actual / this.capacidad) * 25 + 5); // Aumentar presión base para mejor visibilidad en PSI
  }

  get porcentaje() {
    return (this.nivel_actual / this.capacidad) * 100;
  }
}

class Valvula {
  constructor(id, abierta = false) {
    this.id = id;
    this.abierta = abierta;
    this.presion_entrada = 0;
    this.presion_salida = 0;
    this.flujo = 0;
  }

  toggle() {
    this.abierta = !this.abierta;
  }

  abrir() {
    this.abierta = true;
  }

  cerrar() {
    this.abierta = false;
  }
}

class Sensor {
  constructor(tipo, ubicacion) {
    this.tipo = tipo; // 'presion', 'flujo', 'nivel'
    this.ubicacion = ubicacion;
    this.valor = 0;
    this.timestamp = Date.now();
  }

  actualizar(valor) {
    // Aplicar ruido solo si el valor base es positivo, y asegurar que nunca sea negativo
    const ruido = valor > 0 ? (Math.random() - 0.5) * 0.05 : 0;
    this.valor = Math.max(0, valor + ruido);
    this.timestamp = Date.now();
  }
}

export class TankSimulator {
  constructor() {
    // Inicializar tanques
    this.tanques = {
      izq1: new Tanque('izq1', 1000, 1000), // Tanque izquierdo 1 (lleno)
      izq2: new Tanque('izq2', 1000, 1000), // Tanque izquierdo 2 (lleno)
      der1: new Tanque('der1', 1000, 0),    // Tanque derecho 1 (vacío)
      der2: new Tanque('der2', 1000, 0)     // Tanque derecho 2 (vacío)
    };

    // Inicializar válvulas
    this.valvulas = {
      v1: new Valvula('v1', false), // Válvula principal 1
      v2: new Valvula('v2', false), // Válvula principal 2
      v3: new Valvula('v3', true),  // Válvula tanque izq1 (abierta por defecto)
      v4: new Valvula('v4', true),  // Válvula tanque izq2 (abierta por defecto)
      v5: new Valvula('v5', true),  // Válvula tanque der1 (abierta por defecto)
      v6: new Valvula('v6', true)   // Válvula tanque der2 (abierta por defecto)
    };

    // Inicializar sensores
    this.sensores = {
      pre_v1: new Sensor('presion', 'pre_v1'),
      post_v1: new Sensor('presion', 'post_v1'),
      pre_v2: new Sensor('presion', 'pre_v2'),
      post_v2: new Sensor('presion', 'post_v2')
    };

    // Estado del sistema
    this.pausado = false; // Iniciar sin pausa para que funcione inmediatamente
    this.flujo_base = 12; // L/s - Reducir flujo base para simulación más lenta
    this.simulando_fuga = false;
    this.fuga_tanque = null;
    this.fuga_intensidad = 0;

    // Callbacks para eventos
    this.onDataUpdate = null;
    this.onStateChange = null;

    // Timer de simulación
    this.intervalId = null;
    this.dt = 0.5; // 500ms de intervalo (optimizado para mejor rendimiento)
  }

  // Iniciar simulación
  iniciar() {
    if (this.intervalId) return;
    
    this.intervalId = setInterval(() => {
      this.actualizar();
    }, this.dt * 1000);
  }

  // Detener simulación
  detener() {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
  }

  // Pausar/reanudar simulación
  togglePausa() {
    this.pausado = !this.pausado;
    if (this.onStateChange) {
      this.onStateChange({ pausado: this.pausado });
    }
  }

  // Controlar válvulas
  toggleValvula(id) {
    if (this.valvulas[id]) {
      this.valvulas[id].toggle();
      if (this.onStateChange) {
        this.onStateChange({ 
          valvula: id, 
          estado: this.valvulas[id].abierta 
        });
      }
    }
  }

  // Simular fuga
  simularFuga(tanque_id, intensidad = 5) {
    this.simulando_fuga = true;
    this.fuga_tanque = tanque_id;
    this.fuga_intensidad = intensidad;
    
    if (this.onStateChange) {
      this.onStateChange({ 
        fuga: true, 
        tanque: tanque_id, 
        intensidad 
      });
    }
  }

  // Detener fuga
  detenerFuga() {
    this.simulando_fuga = false;
    this.fuga_tanque = null;
    this.fuga_intensidad = 0;
    
    if (this.onStateChange) {
      this.onStateChange({ fuga: false });
    }
  }

  // Lógica principal de actualización
  actualizar() {
    // Optimización: solo calcular si hay cambios significativos
    const tiempoActual = Date.now();
    const deltaTime = tiempoActual - (this.ultimaActualizacion || 0);
    
    // Limitar actualizaciones a máximo 30 FPS para mejor performance
    if (deltaTime < 33) return;
    
    this.ultimaActualizacion = tiempoActual;
    
    // Solo procesar flujos si no está pausado
    if (!this.pausado) {
      // Calcular flujos entre tanques
      this.calcularFlujos();
      
      // Actualizar todos los tanques
      Object.values(this.tanques).forEach(tanque => {
        tanque.actualizar(this.dt);
      });
    } else {
      // Cuando está pausado, asegurar que las presiones estén actualizadas
      Object.values(this.tanques).forEach(tanque => {
        tanque.presion = Math.max(0, (tanque.nivel_actual / tanque.capacidad) * 25 + 5);
      });
    }
    
    // Siempre actualizar sensores para mostrar datos actuales
    this.actualizarSensores();
    
    // Notificar cambios con timestamp para optimización
    if (this.onDataUpdate) {
      const datos = this.getDatos();
      datos.timestamp = tiempoActual;
      this.onDataUpdate(datos);
    }
  }

  // Calcular flujos entre tanques (mejorado con presión y resistencia)
  calcularFlujos() {
    const { izq1, izq2, der1, der2 } = this.tanques;
    const { v1, v2, v3, v4, v5, v6 } = this.valvulas;

    // Resetear flujos
    Object.values(this.tanques).forEach(tanque => {
      tanque.flujo_entrada = 0;
      tanque.flujo_salida = 0;
    });
    Object.values(this.valvulas).forEach(valvula => {
      valvula.flujo = 0;
    });

    // SISTEMA EN SERIE: AMBAS válvulas principales deben estar abiertas para que haya flujo
    if (!v1.abierta || !v2.abierta) return;

    // Verificar condiciones de flujo simplificadas para mejor funcionamiento
    const puede_salir_izq1 = v3.abierta && izq1.nivel_actual > 5; // Reducir umbral mínimo
    const puede_salir_izq2 = v4.abierta && izq2.nivel_actual > 5; // Reducir umbral mínimo
    const puede_entrar_der1 = v5.abierta && der1.nivel_actual < der1.capacidad - 5; // Reducir umbral máximo
    const puede_entrar_der2 = v6.abierta && der2.nivel_actual < der2.capacidad - 5; // Reducir umbral máximo

    if (!(puede_salir_izq1 || puede_salir_izq2) || !(puede_entrar_der1 || puede_entrar_der2)) {
      return;
    }

    // Calcular presiones basadas en nivel y resistencias de válvulas
    const presion_izq1 = puede_salir_izq1 ? izq1.presion : 0;
    const presion_izq2 = puede_salir_izq2 ? izq2.presion : 0;
    const resistencia_der1 = puede_entrar_der1 ? Math.max(0.1, 1 - (der1.nivel_actual / der1.capacidad)) : 0;
    const resistencia_der2 = puede_entrar_der2 ? Math.max(0.1, 1 - (der2.nivel_actual / der2.capacidad)) : 0;

    // Factor de resistencia de válvulas (0.8 = 20% pérdida por fricción)
    const resistencia_valvula = 0.8;

    // SISTEMA EN SERIE: Calcular flujo único que pasa por ambas válvulas
    // El flujo está limitado por la válvula más restrictiva (menor capacidad)
    const presion_entrada_sistema = presion_izq1 * 0.5 + presion_izq2 * 0.5;
    const presion_salida_sistema = (der1.presion + der2.presion) * 0.5;
    const capacidad_salida_sistema = (resistencia_der1 + resistencia_der2) * 0.5;
    
    // Calcular diferencia de presión a través de todo el sistema
    const diferencia_presion_total = Math.max(0.5, presion_entrada_sistema - presion_salida_sistema);
    
    // El flujo está limitado por ambas válvulas en serie (resistencia combinada)
    const resistencia_serie = resistencia_valvula * 0.7; // Mayor resistencia por estar en serie
    
    const flujo_total = Math.max(
      this.flujo_base * 0.2, // Flujo mínimo garantizado (menor por resistencia en serie)
      Math.min(
        this.flujo_base * 0.6, // Flujo máximo reducido por resistencia en serie
        diferencia_presion_total * resistencia_serie * capacidad_salida_sistema * 3.0
      )
    );
    
    // En serie, ambas válvulas tienen el mismo flujo
    const flujo_v1 = flujo_total;
    const flujo_v2 = flujo_total;

    if (flujo_total > 0) {
      // Distribuir salida de tanques izquierdos basado en presión
      if (puede_salir_izq1 && puede_salir_izq2) {
        const factor_izq1 = presion_izq1 / (presion_izq1 + presion_izq2);
        izq1.flujo_salida = flujo_total * factor_izq1;
        izq2.flujo_salida = flujo_total * (1 - factor_izq1);
      } else if (puede_salir_izq1) {
        izq1.flujo_salida = flujo_total;
      } else if (puede_salir_izq2) {
        izq2.flujo_salida = flujo_total;
      }

      // Distribuir entrada a tanques derechos basado en resistencia
      if (puede_entrar_der1 && puede_entrar_der2) {
        const factor_der1 = resistencia_der1 / (resistencia_der1 + resistencia_der2);
        der1.flujo_entrada = flujo_total * factor_der1;
        der2.flujo_entrada = flujo_total * (1 - factor_der1);
      } else if (puede_entrar_der1) {
        der1.flujo_entrada = flujo_total;
      } else if (puede_entrar_der2) {
        der2.flujo_entrada = flujo_total;
      }

      // Actualizar flujos en válvulas principales
      v1.flujo = flujo_v1;
      v2.flujo = flujo_v2;
    }

    // Aplicar fugas si están activas
    if (this.simulando_fuga && this.fuga_tanque) {
      const tanque = this.tanques[this.fuga_tanque];
      if (tanque && tanque.nivel_actual > 0) {
        tanque.flujo_salida += this.fuga_intensidad;
      }
    }
  }

  // Aplicar fugas si están activas (solo visual, no afecta simulación real)
  aplicarFugas() {
    // Las fugas ahora son solo visuales - no modifican los niveles reales
    // La información de fuga se mantiene para mostrar en la UI
    // pero no se aplica flujo_salida real al tanque
  }

  // Actualizar sensores
  actualizarSensores() {
    const { izq1, izq2, der1, der2 } = this.tanques;
    const { v1, v2, v3, v4, v5, v6 } = this.valvulas;

    // SISTEMA EN SERIE: Calcular presiones correctamente
    let presion_entrada_v1 = 0;
    
    // V1 recibe presión directamente de los tanques izquierdos
    if (v3.abierta && izq1.nivel_actual > 10) {
      presion_entrada_v1 += izq1.presion * 0.6;
    }
    
    if (v4.abierta && izq2.nivel_actual > 10) {
      presion_entrada_v1 += izq2.presion * 0.4;
    }
    
    // Establecer presiones base más altas para mejor visualización
    let presion_base = Math.max(presion_entrada_v1, 30); // Mínimo 30 kPa para visualización
    
    // SIN FUGA: las presiones son similares con pérdidas mínimas
    let presion_post_v1 = presion_base * 0.98; // Pérdida mínima sin fuga
    let presion_pre_v2 = presion_post_v1 * 0.98;     // Pérdida mínima sin fuga
    let presion_post_v2 = presion_pre_v2 * 0.98;     // Pérdida mínima sin fuga
    
    // SOLO si hay fuga activa, aplicar caídas de presión significativas
    // Verificar si hay fuga activa desde el estado global
    const fugaGlobalActiva = window.fugaGlobal?.activa || this.simulando_fuga;
    if (fugaGlobalActiva) {
      console.log('🔴 Aplicando efecto de fuga en sensores:', { presion_pre_v2, presion_post_v2 });
      // Reducir pre-v2 y post-v2 aproximadamente a la mitad
      presion_pre_v2 = presion_pre_v2 * 0.5;    // Reducir a la mitad
      presion_post_v2 = presion_post_v2 * 0.5;  // Reducir a la mitad
      console.log('🔴 Presiones después de fuga:', { presion_pre_v2, presion_post_v2 });
    }
    
    // Solo aplicar presiones si las válvulas están abiertas
    if (!v1.abierta) {
      presion_post_v1 = 0;
      presion_pre_v2 = 0;
      presion_post_v2 = 0;
    }
    
    if (!v2.abierta) {
      presion_post_v2 = 0;
    }

    // Actualizar sensores con valores corregidos
    this.sensores.pre_v1.actualizar(Math.max(0, presion_base));
    this.sensores.post_v1.actualizar(Math.max(0, presion_post_v1));
    this.sensores.pre_v2.actualizar(Math.max(0, presion_pre_v2));
    this.sensores.post_v2.actualizar(Math.max(0, presion_post_v2));
    
    // Actualizar presiones en las válvulas para mejor visualización
    v1.presion_entrada = presion_base;
    v1.presion_salida = presion_post_v1;
    v2.presion_entrada = presion_pre_v2;
    v2.presion_salida = presion_post_v2;
    
    // Actualizar presiones en válvulas de tanques
    v3.presion_entrada = izq1.presion;
    v4.presion_entrada = izq2.presion;
    v5.presion_entrada = Math.max(presion_post_v1, presion_post_v2) * 0.9;
    v6.presion_entrada = Math.max(presion_post_v1, presion_post_v2) * 0.9;
  }

  // Obtener datos actuales del sistema
  getDatos() {
    return {
      timestamp: Date.now(),
      pausado: this.pausado,
      tanques: {
        izq1: {
          nivel: this.tanques.izq1.nivel_actual,
          porcentaje: this.tanques.izq1.porcentaje,
          presion: this.tanques.izq1.presion,
          temperatura: this.tanques.izq1.temperatura
        },
        izq2: {
          nivel: this.tanques.izq2.nivel_actual,
          porcentaje: this.tanques.izq2.porcentaje,
          presion: this.tanques.izq2.presion,
          temperatura: this.tanques.izq2.temperatura
        },
        der1: {
          nivel: this.tanques.der1.nivel_actual,
          porcentaje: this.tanques.der1.porcentaje,
          presion: this.tanques.der1.presion,
          temperatura: this.tanques.der1.temperatura
        },
        der2: {
          nivel: this.tanques.der2.nivel_actual,
          porcentaje: this.tanques.der2.porcentaje,
          presion: this.tanques.der2.presion,
          temperatura: this.tanques.der2.temperatura
        }
      },
      valvulas: {
        v1: {
          abierta: this.valvulas.v1.abierta,
          flujo: this.valvulas.v1.flujo,
          presion_entrada: this.sensores.pre_v1.valor,
          presion_salida: this.sensores.post_v1.valor
        },
        v2: {
          abierta: this.valvulas.v2.abierta,
          flujo: this.valvulas.v2.flujo,
          presion_entrada: this.sensores.pre_v2.valor,
          presion_salida: this.sensores.post_v2.valor
        },
        v3: { 
          abierta: this.valvulas.v3.abierta,
          presion_entrada: this.valvulas.v3.presion_entrada || 0,
          flujo: this.tanques.izq1.flujo_salida || 0
        },
        v4: { 
          abierta: this.valvulas.v4.abierta,
          presion_entrada: this.valvulas.v4.presion_entrada || 0,
          flujo: this.tanques.izq2.flujo_salida || 0
        },
        v5: { 
          abierta: this.valvulas.v5.abierta,
          presion_entrada: this.valvulas.v5.presion_entrada || 0,
          flujo: this.tanques.der1.flujo_entrada || 0
        },
        v6: { 
          abierta: this.valvulas.v6.abierta,
          presion_entrada: this.valvulas.v6.presion_entrada || 0,
          flujo: this.tanques.der2.flujo_entrada || 0
        }
      },
      sensores: {
        pre_v1: this.sensores.pre_v1.valor,
        post_v1: this.sensores.post_v1.valor,
        pre_v2: this.sensores.pre_v2.valor,
        post_v2: this.sensores.post_v2.valor
      },
      fuga: {
        activa: this.simulando_fuga,
        tanque: this.fuga_tanque,
        intensidad: this.fuga_intensidad
      }
    };
  }

  // Resetear sistema a estado inicial
  reset() {
    // Resetear tanques
    this.tanques.izq1.nivel_actual = 1000;
    this.tanques.izq2.nivel_actual = 1000;
    this.tanques.der1.nivel_actual = 0;
    this.tanques.der2.nivel_actual = 0;

    // Resetear válvulas
    this.valvulas.v1.abierta = false;
    this.valvulas.v2.abierta = false;
    this.valvulas.v3.abierta = true;
    this.valvulas.v4.abierta = true;
    this.valvulas.v5.abierta = true;
    this.valvulas.v6.abierta = true;

    // Detener fuga
    this.detenerFuga();

    // Pausar sistema
    this.pausado = true;

    if (this.onStateChange) {
      this.onStateChange({ reset: true });
    }
  }

  // Destruir simulador
  destroy() {
    this.detener();
    this.onDataUpdate = null;
    this.onStateChange = null;
  }
}

export default TankSimulator;