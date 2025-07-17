export const initialNodes = [
  {
    id: 'tanque-izq-1',
    type: 'tanque',
    position: { x: 43, y: 195 },
    data: {
      label: 'Tanque Izq 1',
      litrosKey: 'tanque_izq_1',
      litros: 0,
      capacidad: 1000
    },
  },
  {
    id: 'valvula-tanque-izq-1',
    type: 'valvula',
    position: { x: 164, y: 313 },
    data: {
      id: 3,
      estadoKey: 'valvula_tanque_izq_1_estado',
      presionKey: 'valvula_tanque_izq_1_presion',
      estado: false,
      presion: 0,
    },
  },
  {
    id: 'tanque-izq-2',
    type: 'tanque',
    position: { x: 43, y: 420 },
    data: {
      label: 'Tanque Izq 2',
      litrosKey: 'tanque_izq_2',
      litros: 0,
      capacidad: 1000
    },
  },
  {
    id: 'valvula-tanque-izq-2',
    type: 'valvula',
    position: { x: 164, y: 538 },
    data: {
      id: 4,
      estadoKey: 'valvula_tanque_izq_2_estado',
      presionKey: 'valvula_tanque_izq_2_presion',
      estado: false,
      presion: 0,
    },
  },
  {
    id: 'sensor-pre-v1',
    type: 'sensor',
    position: { x: 538, y: 266 },
    data: {
      label: 'Pre-V1',
      presionKey: 'sensor_pre_v1',
      presion: 0,
      tipo: 'entrada'
    },
  },
  {
    id: 'valvula-1',
    type: 'valvula',
    position: { x: 570, y: 312 },
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
    position: { x: 592, y: 266 },
    data: {
      label: 'Post-V1',
      presionKey: 'sensor_post_v1',
      presion: 0,
      tipo: 'salida'
    },
  },

  {
    id: 'sensor-pre-v2',
    type: 'sensor',
    position: { x: 887, y: 158 },
    data: {
      label: 'Pre-V2',
      presionKey: 'sensor_pre_v2',
      presion: 0,
      tipo: 'entrada'
    },
  },

  {
    id: 'valvula-2',
    type: 'valvula',
    position: { x: 919, y: 204 },
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
    position: { x: 940, y: 158 },
    data: {
      label: 'Post-V2',
      presionKey: 'sensor_post_v2',
      presion: 0,
      tipo: 'salida'
    },
  },




  // Tanques lado derecho
  {
    id: 'tanque-der-1',
    type: 'tanque',
    position: { x: 1280, y: 30 },
    data: {
      label: 'Tanque Der 1',
      litrosKey: 'tanque_der_1',
      litros: 0,
      capacidad: 1000
    },
  },
  // Válvula de entrada tanque derecho 1
  {
    id: 'valvula-tanque-der-1',
    type: 'valvula',
    position: { x: 1208, y: 150 },
    data: {
      id: 5,
      estadoKey: 'valvula_tanque_der_1_estado',
      presionKey: 'valvula_tanque_der_1_presion',
      estado: false,
      presion: 0,
    },
  },
  {
    id: 'tanque-der-2',
    type: 'tanque',
    position: { x: 1280, y: 255 },
    data: {
      label: 'Tanque Der 2',
      litrosKey: 'tanque_der_2',
      litros: 0,
      capacidad: 1000
    },
  },
  {
    id: 'valvula-tanque-der-2',
    type: 'valvula',
    position: { x: 1208, y: 375 },
    data: {
      id: 6,
      estadoKey: 'valvula_tanque_der_2_estado',
      presionKey: 'valvula_tanque_der_2_presion',
      estado: false,
      presion: 0,
    },
  },
];

// Ya no se necesitan edges/conexiones visuales