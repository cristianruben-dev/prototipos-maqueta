#!/usr/bin/env python3
import json
import time
import math
import random
import paho.mqtt.client as mqtt
from datetime import datetime


class SimuladorTanques:
    def __init__(self):
        self.client = mqtt.Client()
        self.client.on_connect = self.on_connect
        self.client.on_disconnect = self.on_disconnect
        self.client.on_message = self.on_message

        # Estado inicial de los tanques - Nuevo sistema con 4 tanques
        self.tanques = {
            "tanque_izq_1": {
                "litros": 800.0,  # Tanques izquierdos empiezan llenos
                "capacidad": 1000.0,
                "presion_base": 2.0,
                "flujo_salida": 0.0,  # Inicialmente sin flujo
                "transferiendo": False,
            },
            "tanque_izq_2": {
                "litros": 750.0,  # Tanques izquierdos empiezan llenos
                "capacidad": 1000.0,
                "presion_base": 1.8,
                "flujo_salida": 0.0,  # Inicialmente sin flujo
                "transferiendo": False,
            },
            "tanque_der_1": {
                "litros": 0.0,  # Tanques derechos empiezan vacíos
                "capacidad": 1000.0,
                "presion_base": 1.2,
                "flujo_entrada": 0.0,  # Inicialmente sin flujo
                "transferiendo": False,
            },
            "tanque_der_2": {
                "litros": 0.0,  # Tanques derechos empiezan vacíos
                "capacidad": 1000.0,
                "presion_base": 1.1,
                "flujo_entrada": 0.0,  # Inicialmente sin flujo
                "transferiendo": False,
            },
        }

        # Estados de válvulas
        self.valvulas = {
            "valvula1": {"estado": False, "presion_interna": 0.0},
            "valvula2": {"estado": False, "presion_interna": 0.0},
        }

        # Sensores de presión independientes - empiezan en 0
        self.sensores = {
            "sensor_pre_v1": {"presion": 0.0},
            "sensor_post_v1": {"presion": 0.0},
            "sensor_pre_v2": {"presion": 0.0},
            "sensor_post_v2": {"presion": 0.0},
        }

        # Variables para patrones más realistas
        self.tiempo_inicio = time.time()
        self.ciclo_transferencia = 0  # Para cambiar patrones de transferencia
        self.conectado = False



    def on_connect(self, client, userdata, flags, rc):
        print(f"✅ Conectado a MQTT con código: {rc}")
        self.conectado = True
        # Suscribirse a comandos
        client.subscribe("tanques/comandos")
        print("🎛️  Escuchando comandos de válvulas...")

    def on_disconnect(self, client, userdata, rc):
        print(f"❌ Desconectado de MQTT")
        self.conectado = False

    def on_message(self, client, userdata, msg):
        """Maneja comandos recibidos para válvulas"""
        try:
            comando = json.loads(msg.payload.decode())
            if comando.get("tipo") == "valvula":
                valvula_id = comando.get("id")
                estado = comando.get("estado")

                if valvula_id in [1, 2]:
                    valvula_key = f"valvula{valvula_id}"
                    self.valvulas[valvula_key]["estado"] = estado
                    print(
                        f"🔧 Válvula {valvula_id} {'ABIERTA' if estado else 'CERRADA'}"
                    )
                else:
                    print(f"⚠️  ID de válvula inválido: {valvula_id}")

        except Exception as e:
            print(f"❌ Error procesando comando: {e}")

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
        """Simula transferencia del nuevo sistema con fuente externa hacia tanques izquierdos"""

        # Obtener tanques
        izq1 = self.tanques["tanque_izq_1"]
        izq2 = self.tanques["tanque_izq_2"]
        der1 = self.tanques["tanque_der_1"]
        der2 = self.tanques["tanque_der_2"]

        # Resetear flujos
        izq1["flujo_salida"] = 0
        izq2["flujo_salida"] = 0
        der1["flujo_entrada"] = 0
        der2["flujo_entrada"] = 0

        # Calcular presiones en sensores basado en niveles de tanques izquierdos (sin fuente externa)
        nivel_promedio_izq = (izq1["litros"] + izq2["litros"]) / 2000  # Normalizar
        presion_base_tuberia = (
            nivel_promedio_izq * 50
        )  # Sin presión adicional de fuente externa

        # **NUEVA LÓGICA EN SERIE: Ambas válvulas deben estar abiertas para el flujo**
        valvulas_en_serie_abiertas = (
            self.valvulas["valvula1"]["estado"] and self.valvulas["valvula2"]["estado"]
        )

        if valvulas_en_serie_abiertas and (izq1["litros"] > 5 or izq2["litros"] > 5):
            # Solo hay flujo si AMBAS válvulas están abiertas
            flujo_base = 6.0  # L/s base cuando ambas válvulas están abiertas

            flujo_izq1 = (
                min(flujo_base * dt * 0.5, izq1["litros"] - 2)
                if izq1["litros"] > 5
                else 0
            )
            flujo_izq2 = (
                min(flujo_base * dt * 0.5, izq2["litros"] - 2)
                if izq2["litros"] > 5
                else 0
            )

            flujo_total = flujo_izq1 + flujo_izq2

            # Verificar espacio en tanques destino
            espacio_der1 = der1["capacidad"] - der1["litros"]
            espacio_der2 = der2["capacidad"] - der2["litros"]
            espacio_total = espacio_der1 + espacio_der2

            # Limitar flujo por espacio disponible
            flujo_total = min(flujo_total, espacio_total)

            if flujo_total > 0:
                # Distribuir flujo proporcionalmente según espacio disponible
                if espacio_total > 0:
                    proporcion_der1 = espacio_der1 / espacio_total
                    proporcion_der2 = espacio_der2 / espacio_total

                    flujo_a_der1 = flujo_total * proporcion_der1
                    flujo_a_der2 = flujo_total * proporcion_der2

                    # Calcular proporciones de salida basadas en disponibilidad
                    total_disponible = (izq1["litros"] - 2) + (izq2["litros"] - 2)
                    if total_disponible > 0:
                        proporcion_salida_izq1 = (
                            (izq1["litros"] - 2) / total_disponible
                            if izq1["litros"] > 2
                            else 0
                        )
                        proporcion_salida_izq2 = (
                            (izq2["litros"] - 2) / total_disponible
                            if izq2["litros"] > 2
                            else 0
                        )
                    else:
                        proporcion_salida_izq1 = 0.5
                        proporcion_salida_izq2 = 0.5

                    salida_izq1 = flujo_total * proporcion_salida_izq1
                    salida_izq2 = flujo_total * proporcion_salida_izq2

                    # Actualizar tanques
                    izq1["litros"] -= salida_izq1
                    izq2["litros"] -= salida_izq2
                    der1["litros"] += flujo_a_der1
                    der2["litros"] += flujo_a_der2

                    # Actualizar registros de flujo
                    izq1["flujo_salida"] = salida_izq1 / dt
                    izq2["flujo_salida"] = salida_izq2 / dt
                    der1["flujo_entrada"] = flujo_a_der1 / dt
                    der2["flujo_entrada"] = flujo_a_der2 / dt

            # Actualizar presiones en sensores - CON FLUJO (ambas válvulas abiertas)
            self.sensores["sensor_pre_v1"]["presion"] = (
                presion_base_tuberia + random.uniform(-2, 2)
            )
            self.sensores["sensor_post_v1"]["presion"] = (
                presion_base_tuberia * 0.9
            ) + random.uniform(-1, 1)
            self.sensores["sensor_pre_v2"]["presion"] = (
                presion_base_tuberia * 0.8
            ) + random.uniform(-1.5, 1.5)
            self.sensores["sensor_post_v2"]["presion"] = (
                presion_base_tuberia * 0.7
            ) + random.uniform(-1, 1)

            self.valvulas["valvula1"]["presion_interna"] = presion_base_tuberia * 0.9
            self.valvulas["valvula2"]["presion_interna"] = presion_base_tuberia * 0.8

        else:
            # SIN FLUJO - Al menos una válvula está cerrada o no hay suficiente líquido

            # Presiones cuando no hay flujo completo
            if self.valvulas["valvula1"]["estado"]:
                # V1 abierta pero V2 cerrada o sin líquido: presión se acumula antes de V2
                self.sensores["sensor_pre_v1"]["presion"] = max(
                    0, presion_base_tuberia * 0.6 + random.uniform(-1, 1)
                )
                self.sensores["sensor_post_v1"]["presion"] = max(
                    0, presion_base_tuberia * 0.5 + random.uniform(-1, 1)
                )

                if self.valvulas["valvula2"]["estado"]:
                    # V1 abierta, V2 abierta, pero no hay suficiente líquido
                    self.sensores["sensor_pre_v2"]["presion"] = max(
                        0, presion_base_tuberia * 0.3 + random.uniform(-1, 1)
                    )
                    self.sensores["sensor_post_v2"]["presion"] = max(
                        0, random.uniform(0, 2)
                    )
                else:
                    # V1 abierta, V2 cerrada: presión se acumula antes de V2
                    self.sensores["sensor_pre_v2"]["presion"] = max(
                        0, presion_base_tuberia * 0.4 + random.uniform(-1, 1)
                    )
                    self.sensores["sensor_post_v2"]["presion"] = max(
                        0, random.uniform(0, 1)
                    )

                self.valvulas["valvula1"]["presion_interna"] = 8.0
                self.valvulas["valvula2"]["presion_interna"] = (
                    4.0 if self.valvulas["valvula2"]["estado"] else 2.0
                )
            else:
                # V1 cerrada: sin flujo en todo el sistema
                self.sensores["sensor_pre_v1"]["presion"] = max(
                    0, presion_base_tuberia * 0.2 + random.uniform(-0.5, 0.5)
                )
                self.sensores["sensor_post_v1"]["presion"] = max(
                    0, random.uniform(0, 1)
                )
                self.sensores["sensor_pre_v2"]["presion"] = max(
                    0, random.uniform(0, 0.5)
                )
                self.sensores["sensor_post_v2"]["presion"] = max(
                    0, random.uniform(0, 0.5)
                )

                self.valvulas["valvula1"]["presion_interna"] = 2.0
                self.valvulas["valvula2"]["presion_interna"] = 1.0

        # Asegurar límites en todos los tanques
        for tanque in self.tanques.values():
            tanque["litros"] = max(0, min(tanque["capacidad"], tanque["litros"]))

    def simular_ciclo(self):
        """Un ciclo de simulación"""
        dt = 1.0  # 1 segundo

        # Actualizar transferencia
        self.actualizar_transferencia(dt)

        # Calcular presiones realistas para tanques
        for tanque in self.tanques.values():
            tanque["presion"] = self.calcular_presion_realista(tanque)

        # Preparar datos para envío - Nuevo formato
        datos = {
            "timestamp": datetime.now().isoformat(),
            # Tanques
            "tanque_izq_1": round(self.tanques["tanque_izq_1"]["litros"], 1),
            "tanque_izq_2": round(self.tanques["tanque_izq_2"]["litros"], 1),
            "tanque_der_1": round(self.tanques["tanque_der_1"]["litros"], 1),
            "tanque_der_2": round(self.tanques["tanque_der_2"]["litros"], 1),
            # Válvulas - presión interna y estado
            "valvula1_presion_interna": round(
                self.valvulas["valvula1"]["presion_interna"], 1
            ),
            "valvula1_estado": self.valvulas["valvula1"]["estado"],
            "valvula2_presion_interna": round(
                self.valvulas["valvula2"]["presion_interna"], 1
            ),
            "valvula2_estado": self.valvulas["valvula2"]["estado"],
            # Sensores de presión independientes
            "sensor_pre_v1": round(self.sensores["sensor_pre_v1"]["presion"], 1),
            "sensor_post_v1": round(self.sensores["sensor_post_v1"]["presion"], 1),
            "sensor_pre_v2": round(self.sensores["sensor_pre_v2"]["presion"], 1),
            "sensor_post_v2": round(self.sensores["sensor_post_v2"]["presion"], 1),
            # Estado general del sistema
            "sistema_activo": any(v["estado"] for v in self.valvulas.values()),
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

            print("🚀 Iniciando simulación del nuevo sistema de 4 tanques...")
            print("📊 Sistema: 2 tanques izquierda → 2 válvulas → 2 tanques derecha")
            print("🔧 Control: Válvulas independientes con sensores de presión")
            print("💡 Ctrl+C para detener")

            while True:
                datos = self.simular_ciclo()

                # Enviar datos por MQTT
                mensaje = json.dumps(datos)
                self.client.publish("tanques/datos", mensaje)

                # Log cada 3 segundos
                tiempo_actual = time.time() - self.tiempo_inicio
                if int(tiempo_actual) % 3 == 0:
                    sistema_activo = datos["sistema_activo"]

                    # Información de tanques
                    izq1 = datos["tanque_izq_1"]
                    izq2 = datos["tanque_izq_2"]
                    der1 = datos["tanque_der_1"]
                    der2 = datos["tanque_der_2"]

                    # Estados de válvulas
                    v1_estado = "🟢" if datos["valvula1_estado"] else "🔴"
                    v2_estado = "🟢" if datos["valvula2_estado"] else "🔴"

                    # Log de estado
                    print(f"📊 {'[ACTIVO]' if sistema_activo else '[PAUSADO]'}")
                    print(
                        f"   Izq: T1={izq1}L, T2={izq2}L | Der: T1={der1}L, T2={der2}L"
                    )
                    print(
                        f"   Válvulas: V1={v1_estado}({datos['valvula1_presion_interna']}kPa) | V2={v2_estado}({datos['valvula2_presion_interna']}kPa)"
                    )
                    print(
                        f"   Sensores: Pre-V1={datos['sensor_pre_v1']}kPa, Post-V1={datos['sensor_post_v1']}kPa"
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
