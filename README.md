## Requisitos

- Node.js (v14 o superior)
- Python 3.6 o superior
- Broker MQTT (Mosquitto recomendado)

## Ejecución

### 1. Inicia el broker MQTT

```bash
mosquitto -c mosquitto.conf
```

### 2. Inicia el simulador Python

```bash
cd prototipo/server
python mqtt_simulator.py
```

### 3. Inicia la aplicación React

```bash
cd prototipo
npm run dev
```

