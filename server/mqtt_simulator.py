#!/usr/bin/env python3

import json
import time
import random
import paho.mqtt.client as mqtt

# Datos súper simples - estructura plana
datos = {
    "principal": 1500,
    "secundario1": 300,
    "secundario2": 200,
    "valvula1_presion": 75,
    "valvula1_estado": True,
    "valvula2_presion": 78,
    "valvula2_estado": False,
    "valvula3_presion": 80,
    "valvula3_estado": True,
    "flujo": 5.0,
}


def on_connect(client, userdata, flags, rc):
    print("✅ MQTT conectado" if rc == 0 else "❌ Error MQTT")


def simular():
    # Cambiar todos los valores ligeramente
    datos["principal"] += random.uniform(-2, 2)
    datos["secundario1"] += random.uniform(-1, 1)
    datos["secundario2"] += random.uniform(-1, 1)

    datos["valvula1_presion"] += random.uniform(-0.5, 0.5)
    datos["valvula2_presion"] += random.uniform(-0.5, 0.5)
    datos["valvula3_presion"] += random.uniform(-0.5, 0.5)

    datos["flujo"] += random.uniform(-0.2, 0.2)

    # Mantener rangos
    for key in ["valvula1_presion", "valvula2_presion", "valvula3_presion"]:
        datos[key] = max(70, min(85, datos[key]))
    datos["flujo"] = max(4, min(6, datos["flujo"]))

    # Cambiar estados ocasionalmente
    if random.random() < 0.1:
        estados = ["valvula1_estado", "valvula2_estado", "valvula3_estado"]
        key = random.choice(estados)
        datos[key] = not datos[key]


def main():
    client = mqtt.Client()
    client.on_connect = on_connect

    try:
        client.connect("localhost", 1883, 60)
        client.loop_start()

        print("🚀 Simulador iniciado...")

        while True:
            simular()
            mensaje = json.dumps(datos)
            client.publish("tanques/datos", mensaje)
            print(f"📊 Principal: {datos['principal']:.0f}L")
            time.sleep(2)

    except KeyboardInterrupt:
        print("\n🛑 Detenido")
    finally:
        client.disconnect()


if __name__ == "__main__":
    main()
