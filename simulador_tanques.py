#!/usr/bin/env python3
import json
import time
import math
import paho.mqtt.client as mqtt
from datetime import datetime


class SimuladorTanques:
    def __init__(self):
        self.client = mqtt.Client()
        self.client.on_connect = self.on_connect
        self.client.on_disconnect = self.on_disconnect

        # Estado inicial de los tanques (más realista)
        self.tanques = {
            "principal": {
                "litros": 180.0,  # Empieza casi lleno
                "capacidad": 200.0,
                "presion_base": 2.5,
                "flujo_salida": 2.5,  # L/s (aumentado para ser más visible)
                "transferiendo": True,
            },
            "tanque1": {
                "litros": 10.0,  # Empieza con poco
                "capacidad": 100.0,
                "presion_base": 1.2,
                "flujo_entrada": 1.5,  # L/s (aumentado)
                "transferiendo": True,
            },
            "tanque2": {
                "litros": 15.0,  # Empieza con poco
                "capacidad": 100.0,
                "presion_base": 1.1,
                "flujo_entrada": 1.0,  # L/s (aumentado)
                "transferiendo": True,
            },
        }

        # Variables para patrones más realistas
        self.tiempo_inicio = time.time()
        self.ciclo_transferencia = 0  # Para cambiar patrones de transferencia
        self.conectado = False

    def on_connect(self, client, userdata, flags, rc):
        print(f"✅ Conectado a MQTT con código: {rc}")
        self.conectado = True

    def on_disconnect(self, client, userdata, rc):
        print(f"❌ Desconectado de MQTT")
        self.conectado = False

    def calcular_presion_realista(self, tanque_info):
        """Calcula presión basada en nivel de líquido y patrones realistas"""
        litros = tanque_info["litros"]
        capacidad = tanque_info["capacidad"]
        presion_base = tanque_info["presion_base"]

        # Presión hidrostática (proporcional al nivel)
        nivel_porcentaje = litros / capacidad
        presion_hidrostatica = presion_base * nivel_porcentaje

        # Añadir variaciones pequeñas y realistas
        tiempo_actual = time.time() - self.tiempo_inicio

        # Oscilación pequeña por bomba/vibración (0.02 bar máximo)
        oscilacion_bomba = 0.01 * math.sin(tiempo_actual * 3)

        # Variación térmica lenta (0.05 bar máximo)
        variacion_termica = 0.03 * math.sin(tiempo_actual * 0.1)

        # Presión final
        presion_total = presion_hidrostatica + oscilacion_bomba + variacion_termica

        # Asegurar que no sea negativa
        return max(0.0, presion_total)

    def actualizar_transferencia(self, dt):
        """Simula transferencia realista entre tanques"""
        tiempo_actual = time.time() - self.tiempo_inicio

        # Cambiar patrón de transferencia cada 30 segundos (más rápido)
        if int(tiempo_actual / 30) != self.ciclo_transferencia:
            self.ciclo_transferencia = int(tiempo_actual / 30)
            # Alternar si está transfiriendo o no
            self.tanques["principal"]["transferiendo"] = not self.tanques["principal"][
                "transferiendo"
            ]
            estado = (
                "Transfiriendo"
                if self.tanques["principal"]["transferiendo"]
                else "Pausado"
            )
            print(f"🔄 Cambio de ciclo: {estado}")

        # Solo transferir si está activado
        if not self.tanques["principal"]["transferiendo"]:
            return

        principal = self.tanques["principal"]
        tanque1 = self.tanques["tanque1"]
        tanque2 = self.tanques["tanque2"]

        # Solo transferir si el principal tiene líquido
        if principal["litros"] > 5:  # Reducido el límite mínimo
            # Calcular flujo según presión (más presión = más flujo)
            factor_presion = max(
                0.3, principal["litros"] / principal["capacidad"]
            )  # Mínimo 30%
            flujo_actual = principal["flujo_salida"] * factor_presion * dt

            # No transferir más de lo disponible
            flujo_actual = min(flujo_actual, principal["litros"] - 5)

            # Dividir flujo entre tanque1 y tanque2 (60% y 40%)
            flujo_tanque1 = flujo_actual * 0.6
            flujo_tanque2 = flujo_actual * 0.4

            # Verificar capacidad de tanques receptores
            espacio_tanque1 = tanque1["capacidad"] - tanque1["litros"]
            espacio_tanque2 = tanque2["capacidad"] - tanque2["litros"]

            flujo_tanque1 = min(flujo_tanque1, espacio_tanque1)
            flujo_tanque2 = min(flujo_tanque2, espacio_tanque2)

            # Realizar transferencia
            flujo_total = flujo_tanque1 + flujo_tanque2

            if flujo_total > 0:
                principal["litros"] -= flujo_total
                tanque1["litros"] += flujo_tanque1
                tanque2["litros"] += flujo_tanque2

                # Asegurar límites
                principal["litros"] = max(0, principal["litros"])
                tanque1["litros"] = min(tanque1["capacidad"], tanque1["litros"])
                tanque2["litros"] = min(tanque2["capacidad"], tanque2["litros"])

    def simular_ciclo(self):
        """Un ciclo de simulación"""
        dt = 1.0  # 1 segundo

        # Actualizar transferencia
        self.actualizar_transferencia(dt)

        # Calcular presiones realistas
        for tanque in self.tanques.values():
            tanque["presion"] = self.calcular_presion_realista(tanque)

        # Preparar datos para envío
        datos = {
            "timestamp": datetime.now().isoformat(),
            "principal": {
                "litros": round(self.tanques["principal"]["litros"], 1),
                "presion": round(self.tanques["principal"]["presion"], 2),
            },
            "tanque1": {
                "litros": round(self.tanques["tanque1"]["litros"], 1),
                "presion": round(self.tanques["tanque1"]["presion"], 2),
            },
            "tanque2": {
                "litros": round(self.tanques["tanque2"]["litros"], 1),
                "presion": round(self.tanques["tanque2"]["presion"], 2),
            },
            "estado": (
                "transfiriendo"
                if self.tanques["principal"]["transferiendo"]
                else "pausado"
            ),
        }

        return datos

    def ejecutar(self):
        """Función principal del simulador"""
        try:
            print("🔌 Conectando a MQTT...")
            self.client.connect("localhost", 1883, 60)
            self.client.loop_start()

            # Esperar conexión
            tiempo_espera = 0
            while not self.conectado and tiempo_espera < 10:
                time.sleep(0.5)
                tiempo_espera += 0.5

            if not self.conectado:
                print("❌ No se pudo conectar a MQTT")
                return

            print("🚀 Iniciando simulación RÁPIDA de tanques...")
            print("📊 Patrón: Transferencia cada 30 segundos (más visible)")
            print("⚡ Flujo aumentado para visualización más rápida")
            print("💡 Ctrl+C para detener")

            while True:
                datos = self.simular_ciclo()

                # Enviar datos por MQTT
                mensaje = json.dumps(datos)
                self.client.publish("tanques/datos", mensaje)

                # Log cada 5 segundos (más frecuente)
                tiempo_actual = time.time() - self.tiempo_inicio
                if int(tiempo_actual) % 5 == 0:
                    estado = datos["estado"]
                    p = datos["principal"]
                    t1 = datos["tanque1"]
                    t2 = datos["tanque2"]
                    print(
                        f"📊 [{estado.upper()}] Principal: {p['litros']}L ({p['presion']}bar) | "
                        f"T1: {t1['litros']}L ({t1['presion']}bar) | "
                        f"T2: {t2['litros']}L ({t2['presion']}bar)"
                    )

                time.sleep(1)

        except KeyboardInterrupt:
            print("\n🛑 Simulación detenida por el usuario")
        except Exception as e:
            print(f"❌ Error en simulación: {e}")
        finally:
            self.client.loop_stop()
            self.client.disconnect()


if __name__ == "__main__":
    simulador = SimuladorTanques()
    simulador.ejecutar()
