# Sistema de Monitoreo SCADA - Simulador de Tanques

Un sistema de monitoreo SCADA interactivo desarrollado con React y Vite que simula un sistema de 4 tanques con válvulas controlables y sensores de presión en tiempo real.

## 🚀 Características

- **Simulación en tiempo real** de 4 tanques interconectados
- **Control bidireccional** de válvulas principales
- **Monitoreo de sensores** de presión pre y post válvulas
- **Interfaz SCADA** interactiva con zoom y navegación
- **Gráficos en tiempo real** de presiones y estados
- **Sistema de alertas** para detección de anomalías
- **Historial de datos** con capacidad de descarga
- **Simulación JavaScript pura** - sin dependencias externas
- **Deployable en Vercel** - listo para producción

## 🏗️ Arquitectura

### Versión JavaScript Pura (Recomendada)
- **React 18** con hooks modernos
- **Tailwind CSS** para estilos
- **Lucide React** para iconografía
- **Recharts** para visualización de datos
- **Simulador JavaScript** integrado (sin dependencias externas)
- **Deployable en Vercel/Netlify** sin configuración adicional

### Versión MQTT (Legacy)
- **Frontend:** React + Vite
- **Backend:** Python + Mosquitto MQTT
- **Comunicación:** MQTT.js + Paho MQTT

## 📦 Instalación

### Versión JavaScript Pura (Recomendada)

#### Prerrequisitos
- Node.js 18+

#### 1. Clonar el repositorio
```bash
git clone <repository-url>
cd prototipos-maqueta
```

#### 2. Instalar dependencias
```bash
npm install
# o
pnpm install
```

#### 3. Iniciar la aplicación
```bash
npm run dev
# o
pnpm dev
```

#### 4. Abrir en el navegador
Navega a `http://localhost:5173`

### Versión MQTT (Legacy)

#### Prerrequisitos adicionales
- Python 3.8+
- Mosquitto MQTT Broker

#### Pasos adicionales
```bash
# Instalar dependencias de Python
pip install paho-mqtt

# Iniciar el broker MQTT
mosquitto -c mosquitto.conf

# Iniciar el simulador Python
python server/mqtt_simulator.py
```

## 🌐 Deployment

### Vercel (Recomendado)
1. Conecta tu repositorio a Vercel
2. Vercel detectará automáticamente que es un proyecto Vite
3. El archivo `vercel.json` ya está configurado
4. Deploy automático ✅

### Netlify
1. Conecta tu repositorio a Netlify
2. Build command: `npm run build`
3. Publish directory: `dist`
4. Deploy automático ✅

### Otros proveedores
La aplicación genera archivos estáticos en la carpeta `dist/` que pueden ser servidos desde cualquier servidor web.

