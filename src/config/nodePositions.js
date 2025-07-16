export const initialNodes = [
  // Tanques lado izquierdo
  {
    id: 'tanque-izq-1',
    type: 'tanque',
    position: { x: 340, y: 500 },
    data: {
      label: 'Tanque Izq 1',
      litrosKey: 'tanque_izq_1',
      litros: 0,
      capacidad: 1000
    },
  },
  {
    id: 'tanque-izq-2',
    type: 'tanque',
    position: { x: 420, y: 500 },
    data: {
      label: 'Tanque Izq 2',
      litrosKey: 'tanque_izq_2',
      litros: 0,
      capacidad: 1000
    },
  },

  // Conector para unir tanques izquierdos
  {
    id: 'conector-entrada',
    type: 'connection',
    position: { x: 400, y: 420 },
    data: {
      label: 'Entrada'
    },
  },

  // Sensor entrada tubería principal
  {
    id: 'sensor-pre-v1',
    type: 'sensor',
    position: { x: 480, y: 348 },
    data: {
      label: 'Pre-V1',
      presionKey: 'sensor_pre_v1',
      presion: 0,
      tipo: 'entrada',
      hideHandles: false
    },
  },
  {
    id: 'valvula-1',
    type: 'valvula',
    position: { x: 520, y: 325 },
    data: {
      id: 1,
      estadoKey: 'valvula1_estado',
      presionKey: 'valvula1_presion_interna',
      estado: false,
      presion: 0,
    },
  },

  {
    id: 'sensor-post-v1',
    type: 'sensor',
    position: { x: 595, y: 348 },
    data: {
      label: 'Post-V1',
      presionKey: 'sensor_post_v1',
      presion: 0,
      tipo: 'salida',
      hideHandles: false
    },
  },

  // Toma clandestina después de sensor post-V1
  {
    id: 'toma-1',
    type: 'toma',
    position: { x: 675, y: 276 },
    data: {
      id: 1,
      label: 'Toma Post-V1',
      estado: false,
      flujo: 0,
    },
  },

  {
    id: 'sensor-pre-v2',
    type: 'sensor',
    position: { x: 755, y: 348 },
    data: {
      label: 'Pre-V2',
      presionKey: 'sensor_pre_v2',
      presion: 0,
      tipo: 'entrada',
      hideHandles: false
    },
  },

  {
    id: 'valvula-2',
    type: 'valvula',
    position: { x: 790, y: 325 },
    data: {
      id: 2,
      estadoKey: 'valvula2_estado',
      presionKey: 'valvula2_presion_interna',
      estado: false,
      presion: 0,
    },
  },

  {
    id: 'sensor-post-v2',
    type: 'sensor',
    position: { x: 865, y: 348 },
    data: {
      label: 'Post-V2',
      presionKey: 'sensor_post_v2',
      presion: 0,
      tipo: 'salida',
      hideHandles: false
    },
  },

  // Toma clandestina después de sensor post-V2
  {
    id: 'toma-2',
    type: 'toma',
    position: { x: 955, y: 276 },
    data: {
      id: 2,
      label: 'Toma Post-V2',
      estado: false,
      flujo: 0,
    },
  },

  // Conector para distribuir a tanques derechos
  {
    id: 'conector-salida',
    type: 'connection',
    position: { x: 1090, y: 420 },
    data: {
      label: 'Salida'
    },
  },

  // Tanques lado derecho
  {
    id: 'tanque-der-1',
    type: 'tanque',
    position: { x: 1030, y: 500 },
    data: {
      label: 'Tanque Der 1',
      litrosKey: 'tanque_der_1',
      litros: 0,
      capacidad: 1000
    },
  },
  {
    id: 'tanque-der-2',
    type: 'tanque',
    position: { x: 1100, y: 500 },
    data: {
      label: 'Tanque Der 2',
      litrosKey: 'tanque_der_2',
      litros: 0,
      capacidad: 1000
    },
  },
];

// Configuración inicial de conexiones - Válvulas en línea con conectores
export const initialEdges = [
  // Desde tanques izquierda al conector de entrada
  {
    id: 'e1',
    source: 'tanque-izq-1',
    target: 'conector-entrada',
    sourceHandle: 'salida',
    targetHandle: 'bottom',
    type: 'step',
  },
  {
    id: 'e2',
    source: 'tanque-izq-2',
    target: 'conector-entrada',
    sourceHandle: 'salida',
    targetHandle: 'bottom',
    type: 'step',
  },

  // Desde conector de entrada al sensor pre-v1
  {
    id: 'e3',
    source: 'conector-entrada',
    target: 'sensor-pre-v1',
    sourceHandle: 'right-out',
    targetHandle: 'entrada',
    type: 'step',
  },

  // Flujo en línea: sensor → válvula1 → sensor → válvula2 → sensor
  {
    id: 'e4',
    source: 'sensor-pre-v1',
    target: 'valvula-1',
    sourceHandle: 'salida',
    targetHandle: 'entrada',
    type: 'step',
  },
  {
    id: 'e5',
    source: 'valvula-1',
    target: 'sensor-post-v1',
    sourceHandle: 'salida',
    targetHandle: 'entrada',
    type: 'step',
  },
  {
    id: 'e6',
    source: 'sensor-post-v1',
    target: 'toma-1',
    sourceHandle: 'salida',
    targetHandle: 'entrada',
    type: 'step',
  },
  {
    id: 'e7',
    source: 'toma-1',
    target: 'sensor-pre-v2',
    sourceHandle: 'salida',
    targetHandle: 'entrada',
    type: 'step',
  },
  {
    id: 'e8',
    source: 'sensor-pre-v2',
    target: 'valvula-2',
    sourceHandle: 'salida',
    targetHandle: 'entrada',
    type: 'step',
  },
  {
    id: 'e9',
    source: 'valvula-2',
    target: 'sensor-post-v2',
    sourceHandle: 'salida',
    targetHandle: 'entrada',
    type: 'step',
  },

  // Desde sensor post-v2 hacia toma-2
  {
    id: 'e10',
    source: 'sensor-post-v2',
    target: 'toma-2',
    sourceHandle: 'salida',
    targetHandle: 'entrada',
    type: 'step',
  },

  // Desde toma-2 hacia conector de salida
  {
    id: 'e11',
    source: 'toma-2',
    target: 'conector-salida',
    sourceHandle: 'salida',
    targetHandle: 'left',
    type: 'step',
  },

  // Desde conector de salida hacia tanques derecha
  {
    id: 'e12',
    source: 'conector-salida',
    target: 'tanque-der-1',
    sourceHandle: 'bottom-out',
    targetHandle: 'entrada',
    type: 'step',
  },
  {
    id: 'e13',
    source: 'conector-salida',
    target: 'tanque-der-2',
    sourceHandle: 'bottom-out',
    targetHandle: 'entrada',
    type: 'step',
  },
]; 