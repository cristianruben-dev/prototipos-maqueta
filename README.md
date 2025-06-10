# Sistema de Monitoreo de Tanques

Este proyecto es un sistema de monitoreo en tiempo real para tanques de agua, válvulas y flujos de tuberías, desarrollado con React y un servidor MQTT.

## Características

- Visualización de nivel de agua en tanques principales y secundarios
- Monitoreo de presión en válvulas
- Control de válvulas (abrir/cerrar)
- Visualización de flujo de agua en tuberías
- Comunicación en tiempo real a través de MQTT
- Interfaz responsive y moderna

## Requisitos

- Node.js (v14 o superior)
- Python 3.6 o superior
- Broker MQTT (Mosquitto recomendado)

## Instalación

### 1. Instalar dependencias de React

```bash
cd prototipo
npm install
```

### 2. Instalar dependencias de Python para el simulador

```bash
pip install paho-mqtt
```

### 3. Instalar y configurar el broker MQTT (Mosquitto)

#### En Windows:
Descargar e instalar desde: https://mosquitto.org/download/

#### En Linux:
```bash
sudo apt-get update
sudo apt-get install mosquitto mosquitto-clients
```

## Configuración

### Configuración del Broker MQTT

Asegúrate de que tu broker MQTT esté configurado para aceptar conexiones WebSocket en el puerto 9001.

Ejemplo de configuración para Mosquitto (`mosquitto.conf`):

```
listener 1883
protocol mqtt

listener 9001
protocol websockets
```

## Ejecución

### 1. Inicia el broker MQTT

```bash
# En Windows (desde la ubicación de instalación)
mosquitto -c mosquitto.conf

# En Linux
sudo systemctl start mosquitto
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

## Estructura de datos MQTT

El simulador publica datos en el tema `tanques/datos` con la siguiente estructura:

```json
{
  "tanques": {
    "principal": {"litros": 1500, "capacidad": 2000},
    "secundario1": {"litros": 600, "capacidad": 1000},
    "secundario2": {"litros": 800, "capacidad": 1000}
  },
  "valvulas": {
    "valvula1": {"presion": 45, "flujo": 3.2, "estado": false},
    "valvula2": {"presion": 30, "flujo": 2.5, "estado": false},
    "valvula3": {"presion": 25, "flujo": 1.8, "estado": false}
  },
  "flujos": {
    "principal": 0,
    "secundario1": 0,
    "secundario2": 0
  },
  "timestamp": "2023-11-15 12:30:45"
}
```

## Uso

- Los tanques muestran la cantidad de litros actual y su capacidad máxima
- Las válvulas pueden abrirse o cerrarse con el botón correspondiente
- Los indicadores de presión cambian de color según el nivel:
  - Verde: Presión baja (<30 kPa)
  - Amarillo: Presión media (30-70 kPa)
  - Rojo: Presión alta (>70 kPa)
- Las tuberías muestran el flujo de agua en tiempo real

## Licencia

MIT

