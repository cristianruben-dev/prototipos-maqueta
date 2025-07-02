// Configuración de posiciones y conexiones del sistema de tanques

// Configuración súper simple

export const initialNodes = [
  {
    id: 'tanque-principal',
    type: 'tanque',
    position: { x: 50, y: 270 },
    data: {
      label: 'Tanque Principal',
      litrosKey: 'principal',
      litros: 0,
      capacidad: 2000
    },
  },
  {
    id: 'valvula-1',
    type: 'valvula',
    position: { x: 350, y: 350 },
    data: {
      id: 1,
      presionKey: 'valvula1_presion',
      estadoKey: 'valvula1_estado',
      presion: 0,
      estado: false,
    },
  },
  {
    id: 'valvula-2',
    type: 'valvula',
    position: { x: 650, y: 250 },
    data: {
      id: 2,
      presionKey: 'valvula2_presion',
      estadoKey: 'valvula2_estado',
      presion: 0,
      estado: false,
    },
  },
  {
    id: 'valvula-3',
    type: 'valvula',
    position: { x: 650, y: 450 },
    data: {
      id: 3,
      presionKey: 'valvula3_presion',
      estadoKey: 'valvula3_estado',
      presion: 0,
      estado: false,
    },
  },
  {
    id: 'tanque-secundario-1',
    type: 'tanque',
    position: { x: 950, y: 150 },
    data: {
      label: 'Tanque Secundario 1',
      litrosKey: 'secundario1',
      litros: 0,
      capacidad: 1000
    },
  },
  {
    id: 'tanque-secundario-2',
    type: 'tanque',
    position: { x: 950, y: 550 },
    data: {
      label: 'Tanque Secundario 2',
      litrosKey: 'secundario2',
      litros: 0,
      capacidad: 1000
    },
  },
];

// Configuración inicial de conexiones - Nueva topología en cascada
export const initialEdges = [
  {
    id: 'e1',
    source: 'tanque-principal',
    target: 'valvula-1',
    sourceHandle: 'salida',
    targetHandle: 'entrada',
  },
  {
    id: 'e2',
    source: 'valvula-1',
    target: 'valvula-2',
    sourceHandle: 'salida',
    targetHandle: 'entrada',
  },
  {
    id: 'e3',
    source: 'valvula-1',
    target: 'valvula-3',
    sourceHandle: 'salida',
    targetHandle: 'entrada',
  },
  {
    id: 'e4',
    source: 'valvula-2',
    target: 'tanque-secundario-1',
    sourceHandle: 'salida',
    targetHandle: 'entrada',
  },
  {
    id: 'e5',
    source: 'valvula-3',
    target: 'tanque-secundario-2',
    sourceHandle: 'salida',
    targetHandle: 'entrada',
  },
]; 