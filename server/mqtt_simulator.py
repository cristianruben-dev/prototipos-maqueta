#!/usr/bin/env python3

import json
import time
import random
import paho.mqtt.client as mqtt
from paho.mqtt.client import CallbackAPIVersion
from typing import Dict, Any
from dataclasses import dataclass, asdict


@dataclass
class Valvula:
    id: int
    presion: float
    estado: bool
    flujo_max: float = 10.0

    def get_flujo_actual(self) -> float:
        """Calcula el flujo actual basado en estado y presión"""
        if not self.estado:
            return 0.0
        return (self.presion / 100.0) * self.flujo_max

    def actualizar_presion(self, hay_flujo_real=False):
        """Actualiza la presión con variación realista basada en flujo real"""
        if self.estado and hay_flujo_real:
            # Válvula abierta CON flujo real: presión alta y fluctuante
            variacion = random.uniform(-1.0, 1.0)
            self.presion = max(75.0, min(85.0, self.presion + variacion))
        elif self.estado and not hay_flujo_real:
            # Válvula abierta SIN flujo: presión media (agua estancada)
            variacion = random.uniform(-0.3, 0.3)
            self.presion = max(15.0, min(25.0, self.presion + variacion))
        else:
            # Válvula cerrada: presión interna prácticamente 0 (físicamente correcto)
            self.presion = max(0.0, min(0.5, random.uniform(0.0, 0.5)))


@dataclass
class TomaClandestina:
    id: int
    estado: bool
    flujo: float = 0.0
    flujo_max: float = 3.0  # Máximo flujo de fuga

    def calcular_flujo(self, presion_entrada: float) -> float:
        """Calcula el flujo de fuga basado en la presión disponible"""
        if not self.estado:
            return 0.0

        # Flujo proporcional a la presión disponible con curva más realista
        if presion_entrada <= 0:
            return 0.0
        elif presion_entrada < 5.0:
            # Presión baja: flujo mínimo
            return min(0.5, presion_entrada * 0.1)
        elif presion_entrada < 15.0:
            # Presión media: flujo proporcional
            return min(self.flujo_max * 0.6, presion_entrada * 0.15)
        else:
            # Presión alta: flujo máximo
            return min(self.flujo_max, presion_entrada * 0.2)


@dataclass
class Tanque:
    nombre: str
    capacidad: float
    nivel_actual: float
    flujo_entrada: float = 0.0
    flujo_salida: float = 0.0

    def actualizar_nivel(self, dt: float = 2.0):
        """Actualiza el nivel del tanque basado en flujos"""
        # Calcular espacio disponible
        espacio_disponible = self.capacidad - self.nivel_actual

        # Limitar flujo de entrada según espacio disponible
        flujo_entrada_real = min(self.flujo_entrada, espacio_disponible / dt)

        # Calcular cambio neto
        flujo_neto = flujo_entrada_real - self.flujo_salida
        cambio = flujo_neto * dt

        # Actualizar nivel con límites estrictos
        self.nivel_actual = max(0.0, min(self.capacidad, self.nivel_actual + cambio))

    def get_porcentaje(self) -> float:
        return (self.nivel_actual / self.capacidad) * 100.0


class SistemaSimulacion:
    def __init__(self):
        self.valvulas = {
            1: Valvula(
                1, 3.0, False
            ),  # Válvula 1: controla flujo hacia tanques derecha
            2: Valvula(
                2, 3.0, False
            ),  # Válvula 2: controla flujo independiente hacia tanques derecha
        }

        self.tanques = {
            "tanque_izq_1": Tanque(
                "Tanque Izq 1", 1000.0, 1000.0
            ),  # Tanques izquierdos empiezan llenos al máximo
            "tanque_izq_2": Tanque(
                "Tanque Izq 2", 1000.0, 1000.0
            ),  # Tanques izquierdos empiezan llenos al máximo
            "tanque_der_1": Tanque(
                "Tanque Der 1", 1000.0, 0.0
            ),  # Tanques derechos empiezan vacíos
            "tanque_der_2": Tanque(
                "Tanque Der 2", 1000.0, 0.0
            ),  # Tanques derechos empiezan vacíos
        }

        # Sensores de presión independientes - empiezan en 0
        self.sensores = {
            "sensor_pre_v1": {"presion": 0.0},
            "sensor_post_v1": {"presion": 0.0},
            "sensor_pre_v2": {"presion": 0.0},
            "sensor_post_v2": {"presion": 0.0},
        }

        # Tomas clandestinas - empiezan cerradas
        self.tomas = {
            1: TomaClandestina(1, False),  # Después de sensor post-v1
            2: TomaClandestina(2, False),  # Después de sensor post-v2
        }

        self.flujo_base = 5.0

    def calcular_flujos(self):
        """Calcula los flujos del nuevo sistema EN SERIE - ambas válvulas deben estar abiertas"""

        # Obtener tanques
        izq1 = self.tanques["tanque_izq_1"]
        izq2 = self.tanques["tanque_izq_2"]
        der1 = self.tanques["tanque_der_1"]
        der2 = self.tanques["tanque_der_2"]

        # Resetear flujos
        izq1.flujo_salida = 0
        izq2.flujo_salida = 0
        der1.flujo_entrada = 0
        der2.flujo_entrada = 0

        # Calcular presión base en tuberías según nivel promedio de tanques izquierdos (sin fuente externa)
        nivel_promedio_izq = (
            izq1.nivel_actual + izq2.nivel_actual
        ) / 2000  # Normalizar
        presion_base_tuberia = (
            nivel_promedio_izq * 50
        )  # Sin presión adicional de fuente externa

        # **NUEVA LÓGICA EN SERIE: Ambas válvulas deben estar abiertas para el flujo**
        valvulas_en_serie_abiertas = self.valvulas[1].estado and self.valvulas[2].estado

        flujos = {"flujo_v1": 0.0, "flujo_v2": 0.0, "flujo_total": 0.0}

        # Solo hay flujo si AMBAS válvulas están abiertas
        if valvulas_en_serie_abiertas and (
            izq1.nivel_actual > 5 or izq2.nivel_actual > 5
        ):
            # Verificar espacio en tanques destino
            espacio_der1 = der1.capacidad - der1.nivel_actual
            espacio_der2 = der2.capacidad - der2.nivel_actual
            espacio_total = espacio_der1 + espacio_der2

            if espacio_total > 1.0:
                # Calcular flujo disponible desde tanques izquierda
                flujo_base_disponible = (
                    self.flujo_base * 1.2
                )  # Incrementado para mejor flujo
                flujo_total = min(
                    flujo_base_disponible * nivel_promedio_izq + 2.0,
                    espacio_total / 2.0,
                )

                if flujo_total > 0:
                    # Distribuir flujo proporcionalmente según espacio disponible
                    proporcion_der1 = (
                        espacio_der1 / espacio_total if espacio_total > 0 else 0.5
                    )
                    proporcion_der2 = (
                        espacio_der2 / espacio_total if espacio_total > 0 else 0.5
                    )

                    flujo_a_der1 = flujo_total * proporcion_der1
                    flujo_a_der2 = flujo_total * proporcion_der2

                    # Distribuir salida de tanques izquierda proporcionalmente según disponibilidad
                    total_disponible = max(0, izq1.nivel_actual - 2) + max(
                        0, izq2.nivel_actual - 2
                    )
                    if total_disponible > 0:
                        proporcion_izq1 = (
                            max(0, izq1.nivel_actual - 2) / total_disponible
                        )
                        proporcion_izq2 = (
                            max(0, izq2.nivel_actual - 2) / total_disponible
                        )
                    else:
                        proporcion_izq1 = 0.5
                        proporcion_izq2 = 0.5

                    salida_izq1 = flujo_total * proporcion_izq1
                    salida_izq2 = flujo_total * proporcion_izq2

                    # Actualizar flujos
                    izq1.flujo_salida += salida_izq1
                    izq2.flujo_salida += salida_izq2
                    der1.flujo_entrada += flujo_a_der1
                    der2.flujo_entrada += flujo_a_der2

                    flujos["flujo_total"] = flujo_total

            # Calcular presiones del sistema paso a paso
            presion_pre_v1 = presion_base_tuberia + random.uniform(-2, 2)
            presion_post_v1 = presion_base_tuberia * 0.85 + random.uniform(-1, 1)

            # Toma 1: después del sensor post-v1
            flujo_toma1 = self.tomas[1].calcular_flujo(presion_post_v1)
            self.tomas[1].flujo = flujo_toma1

            # Pérdida de presión por toma 1 - afecta presión antes de V2
            perdida_presion_toma1 = flujo_toma1 * 3.5  # Factor de pérdida aumentado
            presion_pre_v2 = max(
                0,
                presion_base_tuberia * 0.7
                - perdida_presion_toma1
                + random.uniform(-1.5, 1.5),
            )

            # Presión después de V2 - afectada por pérdida de toma 1
            presion_post_v2 = max(0, presion_pre_v2 * 0.9 + random.uniform(-1, 1))

            # Toma 2: después del sensor post-v2
            flujo_toma2 = self.tomas[2].calcular_flujo(presion_post_v2)
            self.tomas[2].flujo = flujo_toma2

            # Pérdida de presión por toma 2 - afecta flujo hacia tanques
            perdida_presion_toma2 = flujo_toma2 * 2.5

            # Reducir flujo hacia tanques si hay fugas
            factor_reduccion_flujo = 1.0 - (flujo_toma1 + flujo_toma2) / 10.0
            factor_reduccion_flujo = max(
                0.5, factor_reduccion_flujo
            )  # Mínimo 50% del flujo

            # Aplicar reducción de flujo por tomas clandestinas
            flujo_total *= factor_reduccion_flujo

            # Recalcular flujos con reducción
            if flujo_total > 0:
                flujo_a_der1 = flujo_total * proporcion_der1
                flujo_a_der2 = flujo_total * proporcion_der2

                # Actualizar flujos reducidos
                der1.flujo_entrada = flujo_a_der1
                der2.flujo_entrada = flujo_a_der2
                flujos["flujo_total"] = flujo_total

            # Actualizar presiones en sensores - CON FLUJO (ambas válvulas abiertas)
            self.sensores["sensor_pre_v1"]["presion"] = presion_pre_v1
            self.sensores["sensor_post_v1"]["presion"] = presion_post_v1
            self.sensores["sensor_pre_v2"]["presion"] = presion_pre_v2
            self.sensores["sensor_post_v2"]["presion"] = presion_post_v2
        else:
            # SIN FLUJO - Al menos una válvula está cerrada o no hay suficiente líquido

            # Tomas clandestinas con presión residual - pueden funcionar con presión limitada
            presion_residual_post_v1 = (
                presion_base_tuberia * 0.3 if self.valvulas[1].estado else 0.0
            )
            presion_residual_post_v2 = (
                presion_base_tuberia * 0.15
                if (self.valvulas[1].estado and self.valvulas[2].estado)
                else 0.0
            )

            flujo_toma1_residual = self.tomas[1].calcular_flujo(
                presion_residual_post_v1
            )
            flujo_toma2_residual = self.tomas[2].calcular_flujo(
                presion_residual_post_v2
            )

            self.tomas[1].flujo = flujo_toma1_residual
            self.tomas[2].flujo = flujo_toma2_residual

            # Presiones cuando no hay flujo completo - COMPORTAMIENTO FÍSICAMENTE CORRECTO
            if self.valvulas[1].estado:
                # V1 abierta pero V2 cerrada o sin líquido: presión se acumula antes de V2
                self.sensores["sensor_pre_v1"]["presion"] = max(
                    0, presion_base_tuberia * 0.6 + random.uniform(-1, 1)
                )
                self.sensores["sensor_post_v1"]["presion"] = max(
                    0, presion_base_tuberia * 0.5 + random.uniform(-1, 1)
                )

                if self.valvulas[2].estado:
                    # V1 abierta, V2 abierta, pero no hay suficiente líquido
                    self.sensores["sensor_pre_v2"]["presion"] = max(
                        0, presion_base_tuberia * 0.3 + random.uniform(-1, 1)
                    )
                    # Sin flujo real = presión cero después de V2
                    self.sensores["sensor_post_v2"]["presion"] = 0.0
                else:
                    # V1 abierta, V2 CERRADA: presión se acumula antes de V2, CERO después
                    self.sensores["sensor_pre_v2"]["presion"] = max(
                        0, presion_base_tuberia * 0.4 + random.uniform(-1, 1)
                    )
                    # V2 cerrada = presión 0 después de la válvula
                    self.sensores["sensor_post_v2"]["presion"] = 0.0
            else:
                # V1 CERRADA: sin flujo en todo el sistema
                # Presión residual antes de V1 (de tanques)
                self.sensores["sensor_pre_v1"]["presion"] = max(
                    0, presion_base_tuberia * 0.2 + random.uniform(-0.5, 0.5)
                )
                # V1 cerrada = presión 0 en todo el sistema después de V1
                self.sensores["sensor_post_v1"]["presion"] = 0.0
                self.sensores["sensor_pre_v2"]["presion"] = 0.0
                self.sensores["sensor_post_v2"]["presion"] = 0.0

        return flujos

    def actualizar_sistema(self):
        """Actualiza todo el sistema"""
        # Calcular flujos
        flujos = self.calcular_flujos()

        # Determinar si hay flujo real (solo cuando ambas válvulas están abiertas)
        hay_flujo_real = flujos["flujo_total"] > 0
        valvulas_en_serie = self.valvulas[1].estado and self.valvulas[2].estado

        # Actualizar válvulas con información de flujo real
        self.valvulas[1].actualizar_presion(hay_flujo_real and valvulas_en_serie)
        self.valvulas[2].actualizar_presion(hay_flujo_real and valvulas_en_serie)

        # Actualizar tanques
        for tanque in self.tanques.values():
            tanque.actualizar_nivel()

        return flujos

    def cambiar_valvula(self, valvula_id: int, nuevo_estado: bool):
        """Cambia el estado de una válvula"""
        if valvula_id in self.valvulas:
            self.valvulas[valvula_id].estado = nuevo_estado
            print(f"🔧 Válvula {valvula_id} {'ABIERTA' if nuevo_estado else 'CERRADA'}")
        else:
            print(
                f"⚠️  ID de válvula inválido: {valvula_id} (solo válvulas 1 y 2 disponibles)"
            )

    def cambiar_toma_clandestina(self, toma_id: int, nuevo_estado: bool):
        """Cambia el estado de una toma clandestina"""
        if toma_id in self.tomas:
            self.tomas[toma_id].estado = nuevo_estado
            print(
                f"🚰 Toma clandestina {toma_id} {'ABIERTA' if nuevo_estado else 'CERRADA'}"
            )
        else:
            print(f"⚠️  ID de toma inválido: {toma_id} (solo tomas 1 y 2 disponibles)")

    def get_datos_mqtt(self, flujos: Dict[str, float]) -> Dict[str, Any]:
        """Genera los datos para enviar por MQTT en el nuevo formato"""
        return {
            # Tanques - nuevo formato
            "tanque_izq_1": round(self.tanques["tanque_izq_1"].nivel_actual, 1),
            "tanque_izq_2": round(self.tanques["tanque_izq_2"].nivel_actual, 1),
            "tanque_der_1": round(self.tanques["tanque_der_1"].nivel_actual, 1),
            "tanque_der_2": round(self.tanques["tanque_der_2"].nivel_actual, 1),
            # Válvulas - presión interna y estado
            "valvula1_presion_interna": round(self.valvulas[1].presion, 1),
            "valvula1_estado": self.valvulas[1].estado,
            "valvula2_presion_interna": round(self.valvulas[2].presion, 1),
            "valvula2_estado": self.valvulas[2].estado,
            # Sensores de presión independientes
            "sensor_pre_v1": round(self.sensores["sensor_pre_v1"]["presion"], 1),
            "sensor_post_v1": round(self.sensores["sensor_post_v1"]["presion"], 1),
            "sensor_pre_v2": round(self.sensores["sensor_pre_v2"]["presion"], 1),
            "sensor_post_v2": round(self.sensores["sensor_post_v2"]["presion"], 1),
            # Tomas clandestinas
            "toma1_estado": self.tomas[1].estado,
            "toma1_flujo": round(self.tomas[1].flujo, 1),
            "toma2_estado": self.tomas[2].estado,
            "toma2_flujo": round(self.tomas[2].flujo, 1),
            # Información del sistema
            "sistema_activo": any(v.estado for v in self.valvulas.values()),
            "flujos": flujos,
            "flujo_total": round(sum(flujos.values()), 2),
            # Detección de tomas clandestinas
            "tomas_detectadas": any(
                t.estado and t.flujo > 0 for t in self.tomas.values()
            ),
        }


class MQTTManager:
    def __init__(self, sistema: SistemaSimulacion):
        self.sistema = sistema
        self.client = mqtt.Client(callback_api_version=CallbackAPIVersion.VERSION1)
        self.client.on_connect = self.on_connect
        self.client.on_message = self.on_message

    def on_connect(self, client, userdata, flags, rc):
        if rc == 0:
            print("✅ MQTT Conectado")
            # Suscribirse a comandos de válvulas
            client.subscribe("tanques/comandos")
            print("🎛️  Escuchando comandos...")
        else:
            print(f"❌ Error MQTT: {rc}")

    def on_message(self, client, userdata, msg):
        """Maneja comandos recibidos"""
        try:
            comando = json.loads(msg.payload.decode())
            print(f"📨 Comando recibido: {comando}")
            if comando.get("tipo") == "valvula":
                valvula_id = comando.get("id")
                estado = comando.get("estado")
                self.sistema.cambiar_valvula(valvula_id, estado)
            elif comando.get("tipo") == "toma_clandestina":
                toma_id = comando.get("id")
                estado = comando.get("estado")
                print(f"🚰 Procesando toma {toma_id} -> {estado}")
                self.sistema.cambiar_toma_clandestina(toma_id, estado)
        except Exception as e:
            print(f"❌ Error procesando comando: {e}")

    def conectar(self):
        """Conecta al broker MQTT"""
        try:
            self.client.connect("localhost", 1883, 60)
            self.client.loop_start()
            return True
        except Exception as e:
            print(f"❌ Error conectando: {e}")
            return False

    def publicar_datos(self, datos: Dict[str, Any]):
        """Publica datos del sistema"""
        mensaje = json.dumps(datos)
        self.client.publish("tanques/datos", mensaje)

    def desconectar(self):
        """Desconecta del broker"""
        self.client.disconnect()


def main():
    # Inicializar sistema
    sistema = SistemaSimulacion()
    mqtt_manager = MQTTManager(sistema)

    if not mqtt_manager.conectar():
        return

    print("🚀 Simulador del nuevo sistema de 4 tanques iniciado...")
    print("📊 Sistema: 2 tanques izquierda → 2 válvulas → 2 tanques derecha")
    print("🔧 Control: Válvulas independientes con sensores de presión")
    print("🎛️  Control bidireccional de válvulas habilitado")

    try:
        while True:
            # Actualizar sistema
            flujos = sistema.actualizar_sistema()

            # Preparar datos
            datos = sistema.get_datos_mqtt(flujos)

            # Publicar
            mqtt_manager.publicar_datos(datos)

            # Log de estado - Nuevo sistema con 4 tanques
            sistema_activo = datos["sistema_activo"]

            # Información de tanques
            izq1 = datos["tanque_izq_1"]
            izq2 = datos["tanque_izq_2"]
            der1 = datos["tanque_der_1"]
            der2 = datos["tanque_der_2"]

            # Indicadores de estado de válvulas
            v1_flujo = flujos.get("flujo_v1", 0) > 0
            v2_flujo = flujos.get("flujo_v2", 0) > 0

            v1_estado = (
                "🟢💧"
                if (sistema.valvulas[1].estado and v1_flujo)
                else "🟢⚪" if sistema.valvulas[1].estado else "🔴"
            )
            v2_estado = (
                "🟢💧"
                if (sistema.valvulas[2].estado and v2_flujo)
                else "🟢⚪" if sistema.valvulas[2].estado else "🔴"
            )

            # Porcentajes de llenado
            izq1_pct = (izq1 / 1000.0) * 100
            izq2_pct = (izq2 / 1000.0) * 100
            der1_pct = (der1 / 1000.0) * 100
            der2_pct = (der2 / 1000.0) * 100

            # Log principal
            print(f"📊 {'[ACTIVO]' if sistema_activo else '[PAUSADO]'}")
            print(
                f"   Izq: T1={izq1}L({izq1_pct:.0f}%), T2={izq2}L({izq2_pct:.0f}%) | Der: T1={der1}L({der1_pct:.0f}%), T2={der2}L({der2_pct:.0f}%)"
            )
            print(
                f"   Válvulas: V1={v1_estado}({datos['valvula1_presion_interna']:.1f}kPa) | V2={v2_estado}({datos['valvula2_presion_interna']:.1f}kPa)"
            )
            print(
                f"   Sensores: Pre-V1={datos['sensor_pre_v1']:.1f}kPa, Post-V1={datos['sensor_post_v1']:.1f}kPa | Pre-V2={datos['sensor_pre_v2']:.1f}kPa, Post-V2={datos['sensor_post_v2']:.1f}kPa"
            )

            # Información de tomas clandestinas
            toma1_estado = (
                "🔴"
                if not datos["toma1_estado"]
                else f"🚰({datos['toma1_flujo']:.1f}L/s)"
            )
            toma2_estado = (
                "🔴"
                if not datos["toma2_estado"]
                else f"🚰({datos['toma2_flujo']:.1f}L/s)"
            )

            print(f"   Tomas: T1={toma1_estado} | T2={toma2_estado}")

            # Alerta de tomas detectadas con detalles
            if datos["tomas_detectadas"]:
                alertas = []
                if datos["toma1_estado"] and datos["toma1_flujo"] > 0:
                    alertas.append(f"T1({datos['toma1_flujo']:.1f}L/s)")
                if datos["toma2_estado"] and datos["toma2_flujo"] > 0:
                    alertas.append(f"T2({datos['toma2_flujo']:.1f}L/s)")
                print(f"   ⚠️  ALERTA: Tomas activas: {', '.join(alertas)}")

                # Mostrar impacto en presiones
                if datos["toma1_flujo"] > 0:
                    print(
                        f"   📉 Toma 1 causa pérdida de presión en Pre-V2: -{datos['toma1_flujo'] * 3.5:.1f}kPa"
                    )
                if datos["toma2_flujo"] > 0:
                    print(
                        f"   📉 Toma 2 reduce flujo a tanques: -{datos['toma2_flujo'] * 25:.0f}%"
                    )

            time.sleep(2)

    except KeyboardInterrupt:
        print("\n🛑 Simulador detenido")
    finally:
        mqtt_manager.desconectar()


if __name__ == "__main__":
    main()
