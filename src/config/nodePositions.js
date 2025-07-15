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

  // Sensor entrada tubería principal (más cerca)
  {
    id: 'sensor-pre-v1',
    type: 'sensor',
    position: { x: 470, y: 348 },
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
    position: { x: 510, y: 325 },
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
    position: { x: 585, y: 348 },
    data: {
      label: 'Post-V1',
      presionKey: 'sensor_post_v1',
      presion: 0,
      tipo: 'salida',
      hideHandles: false
    },
  },

  {
    id: 'sensor-pre-v2',
    type: 'sensor',
    position: { x: 865, y: 348 },
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
    position: { x: 900, y: 325 },
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
    position: { x: 975, y: 348 },
    data: {
      label: 'Post-V2',
      presionKey: 'sensor_post_v2',
      presion: 0,
      tipo: 'salida',
      hideHandles: false
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

// Configuración inicial de conexiones - Válvulas en línea
export const initialEdges = [
  // Desde tanques izquierda al primer sensor
  {
    id: 'e1',
    source: 'tanque-izq-1',
    target: 'sensor-pre-v1',
    sourceHandle: 'salida',
    targetHandle: 'entrada',
    type: 'step',
  },
  {
    id: 'e2',
    source: 'tanque-izq-2',
    target: 'sensor-pre-v1',
    sourceHandle: 'salida',
    targetHandle: 'entrada',
    type: 'step',
  },

  // Flujo en línea: sensor → válvula1 → sensor → válvula2 → sensor
  {
    id: 'e3',
    source: 'sensor-pre-v1',
    target: 'valvula-1',
    sourceHandle: 'salida',
    targetHandle: 'entrada',
    type: 'step',
  },
  {
    id: 'e4',
    source: 'valvula-1',
    target: 'sensor-post-v1',
    sourceHandle: 'salida',
    targetHandle: 'entrada',
    type: 'step',
  },
  {
    id: 'e5',
    source: 'sensor-post-v1',
    target: 'sensor-pre-v2',
    sourceHandle: 'salida',
    targetHandle: 'entrada',
    type: 'step',
  },
  {
    id: 'e6',
    source: 'sensor-pre-v2',
    target: 'valvula-2',
    sourceHandle: 'salida',
    targetHandle: 'entrada',
    type: 'step',
  },
  {
    id: 'e7',
    source: 'valvula-2',
    target: 'sensor-post-v2',
    sourceHandle: 'salida',
    targetHandle: 'entrada',
    type: 'step',
  },

  // Desde sensor final hacia tanques derecha
  {
    id: 'e8',
    source: 'sensor-post-v2',
    target: 'tanque-der-1',
    sourceHandle: 'salida',
    targetHandle: 'entrada',
    type: 'step',
  },
  {
    id: 'e9',
    source: 'sensor-post-v2',
    target: 'tanque-der-2',
    sourceHandle: 'salida',
    targetHandle: 'entrada',
    type: 'step',
  },
]; 