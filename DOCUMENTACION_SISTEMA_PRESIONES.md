# Documentación Técnica: Sistema de Presiones y Tomas Clandestinas

## Descripción General del Sistema

El sistema simula una red de distribución de agua industrial con:
- **2 tanques izquierdos** (fuente) → **2 válvulas en serie** → **2 tanques derechos** (destino)
- **4 sensores de presión** (pre-V1, post-V1, pre-V2, post-V2)
- **2 tomas clandestinas** (después de post-V1 y post-V2)

## Arquitectura del Sistema

```
[T1_izq] ──┐
           ├──→ [Pre-V1] → [V1] → [Post-V1] → [Toma1] → [Pre-V2] → [V2] → [Post-V2] → [Toma2] → ┌──→ [T1_der]
[T2_izq] ──┘                                                                                      └──→ [T2_der]
```

## Funcionamiento Normal (Sin Tomas Clandestinas)

### Condiciones Iniciales
- **Tanques izquierdos**: 1000L cada uno (100% capacidad)
- **Tanques derechos**: 0L (vacíos)
- **Válvulas**: Cerradas inicialmente
- **Tomas clandestinas**: Cerradas

### Comportamiento de Presiones

#### Caso 1: Ambas válvulas cerradas
- **Pre-V1**: 7-10 kPa (presión residual de tanques)
- **Post-V1**: 0 kPa (válvula cerrada)
- **Pre-V2**: 0 kPa (no hay flujo)
- **Post-V2**: 0 kPa (no hay flujo)

#### Caso 2: Solo V1 abierta, V2 cerrada
- **Pre-V1**: 15-25 kPa (presión con flujo parcial)
- **Post-V1**: 10-20 kPa (presión acumulada)
- **Pre-V2**: 8-18 kPa (presión antes de V2)
- **Post-V2**: 0 kPa (V2 cerrada)

#### Caso 3: Ambas válvulas abiertas (flujo completo)
- **Pre-V1**: 30-50 kPa (presión máxima)
- **Post-V1**: 25-45 kPa (ligera caída de presión)
- **Pre-V2**: 20-40 kPa (presión antes de V2)
- **Post-V2**: 15-35 kPa (presión de salida)

## Comportamiento con Tomas Clandestinas

### Toma Clandestina 1 (Después de Post-V1)

#### Efectos cuando está abierta:
1. **Extracción de flujo**: Hasta 3.0 L/s dependiendo de la presión
2. **Pérdida de presión**: Reduce la presión en Pre-V2
3. **Impacto downstream**: Afecta todo el flujo hacia tanques derechos

#### Valores esperados:
- **Con toma cerrada**: Pre-V2 = 20-40 kPa
- **Con toma abierta**: Pre-V2 = 10-25 kPa (reducción de 10-15 kPa)

### Toma Clandestina 2 (Después de Post-V2)

#### Efectos cuando está abierta:
1. **Extracción de flujo**: Hasta 3.0 L/s dependiendo de la presión
2. **Pérdida de presión**: Reduce el flujo hacia tanques derechos
3. **Impacto en llenado**: Los tanques derechos se llenan más lentamente

#### Valores esperados:
- **Con toma cerrada**: Flujo total a tanques = 100%
- **Con toma abierta**: Flujo total a tanques = 70-85%

## Algoritmo de Detección

### Criterios de Detección
1. **Toma activa**: estado = true
2. **Flujo detectado**: flujo > 0 L/s
3. **Pérdida de presión**: Caída anormal en sensores downstream

### Valores Críticos
- **Flujo mínimo detectable**: 0.1 L/s
- **Pérdida de presión crítica**: > 10 kPa
- **Tiempo de detección**: Instantáneo

## Cálculos de Presión

### Presión Base
```
presion_base = (nivel_promedio_tanques_izq / 2000) * 50 kPa
```

### Pérdidas por Tomas
```
perdida_presion = flujo_toma * 2.0 kPa
presion_downstream = presion_upstream - perdida_presion
```

### Flujo de Tomas
```
flujo_toma = min(flujo_max, presion_entrada * 0.1)
```

## Alertas y Monitoreo

### Condiciones de Alerta
- **Toma detectada**: Cualquier toma con flujo > 0
- **Pérdida crítica**: Caída de presión > 15 kPa
- **Eficiencia reducida**: Flujo total < 80% del esperado

### Ubicación de Tomas
- **Toma 1**: Entre Post-V1 y Pre-V2
- **Toma 2**: Después de Post-V2

## Valores de Referencia

### Flujos Normales
- **Flujo máximo sistema**: 12.0 L/s
- **Flujo por toma**: 0.0 - 3.0 L/s
- **Flujo base**: 5.0 L/s

### Presiones Típicas
- **Tanques llenos**: 25-50 kPa
- **Tanques medios**: 15-30 kPa
- **Tanques vacíos**: 5-15 kPa

### Capacidades
- **Tanques**: 1000L cada uno
- **Tiempo llenado**: ~5-8 minutos (con ambas válvulas abiertas)
- **Tiempo detección**: < 2 segundos

## Mantenimiento y Calibración

### Verificación Periódica
1. **Sensores**: Verificar lecturas con sistema sin flujo
2. **Válvulas**: Comprobar apertura/cierre completo
3. **Tomas**: Validar detección con flujos conocidos

### Parámetros Ajustables
- **Sensibilidad detección**: Factor de flujo mínimo
- **Tiempo respuesta**: Intervalo de actualización
- **Umbrales alerta**: Límites de presión y flujo

---

**Nota**: Este documento describe el comportamiento teórico del sistema. Los valores reales pueden variar según las condiciones operativas y la calibración de los sensores. 