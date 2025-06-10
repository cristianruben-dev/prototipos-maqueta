#!/usr/bin/env python3
"""
Simulador MQTT para el sistema de monitoreo de tanques.
Este script genera datos simulados de tanques, válvulas y flujos, y los publica a un broker MQTT.
"""

import json
import time
import random
import paho.mqtt.client as mqtt
from datetime import datetime

# Configuración del broker MQTT
MQTT_BROKER = "localhost"
MQTT_PORT = 1883
MQTT_TOPIC = "tanques/datos"

# Estado inicial del sistema
sistema = {
    "tanques": {
        "principal": {"litros": 2000, "capacidad": 2000},
        "secundario1": {"litros": 0, "capacidad": 1000},
        "secundario2": {"litros": 0, "capacidad": 1000}
    },
    "valvulas": {
        "valvula1": {"presion": 75, "estado": False},
        "valvula2": {"presion": 78, "estado": False},
        "valvula3": {"presion": 80, "estado": False}
    },
    "flujos": {
        "principal": 5.0
    },
    "timestamp": ""
}

# Valor previo para crear cambios más suaves
flujo_previo = sistema["flujos"]["principal"]

# Callback para cuando el cliente se conecta al broker
def on_connect(client, userdata, flags, rc):
    if rc == 0:
        print(f"Conectado al broker MQTT ({MQTT_BROKER}:{MQTT_PORT})")
    else:
        print(f"Error al conectar al broker MQTT, código: {rc}")

# Configurar cliente MQTT
client = mqtt.Client()
client.on_connect = on_connect

# Función para simular cambios en los datos
def simular_cambios():
    global sistema, flujo_previo
    
    # Actualizar timestamp
    sistema["timestamp"] = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    
    # Simular cambios en los estados de las válvulas (ocasionalmente)
    for valvula in sistema["valvulas"]:
        if random.random() < 0.05:  # 5% de probabilidad de cambio
            sistema["valvulas"][valvula]["estado"] = not sistema["valvulas"][valvula]["estado"]
    
    # Simular flujo principal con cambios suaves (poca variación)
    # Usar el valor previo para crear transiciones más suaves
    cambio_flujo = random.uniform(-0.2, 0.2)  # Cambio muy pequeño para mayor estabilidad
    nuevo_flujo = flujo_previo + cambio_flujo
    nuevo_flujo = max(4.8, min(5.2, nuevo_flujo))  # Mantener entre 4.8 y 5.2 L/s
    sistema["flujos"]["principal"] = round(nuevo_flujo, 1)
    flujo_previo = sistema["flujos"]["principal"]
    
    # Actualizar presiones con variación aleatoria (siempre por encima de 70)
    for valvula in sistema["valvulas"]:
        # Si la válvula está abierta, variar la presión un poco
        if sistema["valvulas"][valvula]["estado"]:
            base_presion = sistema["valvulas"][valvula]["presion"]
            # Variación menor cuando está abierta
            nueva_presion = base_presion + random.uniform(-1, 1.5)
        else:
            base_presion = sistema["valvulas"][valvula]["presion"]
            nueva_presion = base_presion + random.uniform(-0.5, 0.8)
            
        nueva_presion = max(72, min(88, nueva_presion))  # Mantener entre 72 y 88 kPa
        sistema["valvulas"][valvula]["presion"] = round(nueva_presion, 1)
    
    # Actualizar volúmenes de tanques basados en el flujo principal
    # Si hay flujo, disminuir el tanque principal
    if sistema["flujos"]["principal"] > 0:
        # El flujo principal afecta al tanque principal
        sistema["tanques"]["principal"]["litros"] -= sistema["flujos"]["principal"] * 1  # 1 segundo
        sistema["tanques"]["principal"]["litros"] = max(0, sistema["tanques"]["principal"]["litros"])
        
        # El flujo principal se divide entre los tanques secundarios basado en válvulas
        valvulas_abiertas = sum(1 for v in sistema["valvulas"].values() if v["estado"])
        
        if valvulas_abiertas > 0:
            # Dividir el flujo entre las válvulas abiertas
            flujo_por_valvula = sistema["flujos"]["principal"] / valvulas_abiertas
            
            # Actualizar tanques secundarios basados en estado de válvulas
            if sistema["valvulas"]["valvula1"]["estado"]:
                sistema["tanques"]["secundario1"]["litros"] += flujo_por_valvula * 0.5  # Factor de 0.5 para ajustar
                sistema["tanques"]["secundario1"]["litros"] = min(
                    sistema["tanques"]["secundario1"]["capacidad"],
                    sistema["tanques"]["secundario1"]["litros"]
                )
                
            if sistema["valvulas"]["valvula2"]["estado"]:
                sistema["tanques"]["secundario2"]["litros"] += flujo_por_valvula * 0.5  # Factor de 0.5 para ajustar
                sistema["tanques"]["secundario2"]["litros"] = min(
                    sistema["tanques"]["secundario2"]["capacidad"],
                    sistema["tanques"]["secundario2"]["litros"]
                )
    
    # Redondear valores de litros
    for tanque in sistema["tanques"]:
        sistema["tanques"][tanque]["litros"] = round(sistema["tanques"][tanque]["litros"], 1)
    
    # Simular llenado del tanque principal cuando está muy bajo
    if sistema["tanques"]["principal"]["litros"] < 200:
        if random.random() < 0.8:  # 80% de probabilidad de llenado
            aumento = random.uniform(10, 30)
            sistema["tanques"]["principal"]["litros"] += aumento
            print(f"Llenando tanque principal: +{aumento:.1f} litros")

# Programa principal
def main():
    try:
        # Conectar al broker MQTT
        print(f"Conectando al broker MQTT en {MQTT_BROKER}:{MQTT_PORT}...")
        client.connect(MQTT_BROKER, MQTT_PORT, 60)
        
        # Iniciar el loop en segundo plano
        client.loop_start()
        
        print(f"Publicando datos simulados en el tema '{MQTT_TOPIC}'")
        print("Presiona Ctrl+C para detener")
        
        while True:
            # Simular cambios en los datos
            simular_cambios()
            
            # Publicar datos actualizados
            mensaje = json.dumps(sistema)
            client.publish(MQTT_TOPIC, mensaje)
            
            # Mostrar información en consola
            valvula_estados = ", ".join([f"V{i+1}:{'ON' if v['estado'] else 'OFF'}" for i, v in enumerate([
                sistema['valvulas']['valvula1'], 
                sistema['valvulas']['valvula2'], 
                sistema['valvulas']['valvula3']
            ])])
            
            print(f"[{sistema['timestamp']}] " + 
                  f"Principal: {sistema['tanques']['principal']['litros']:.1f}L, " + 
                  f"Sec1: {sistema['tanques']['secundario1']['litros']:.1f}L, " + 
                  f"Sec2: {sistema['tanques']['secundario2']['litros']:.1f}L, " +
                  f"Flujo: {sistema['flujos']['principal']:.1f}L/s, " +
                  f"Válvulas: {valvula_estados}")
            
            # Esperar antes de la siguiente actualización
            time.sleep(1)
            
    except KeyboardInterrupt:
        print("\nDeteniendo simulador...")
    except Exception as e:
        print(f"Error: {e}")
    finally:
        client.loop_stop()
        client.disconnect()
        print("Desconectado del broker MQTT")

if __name__ == "__main__":
    main() 