#!/usr/bin/env python3

import json
import time
import random
import paho.mqtt.client as mqtt
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

    def actualizar_presion(self):
        """Actualiza la presión con variación realista"""
        if self.estado:
            # Válvula abierta: presión alta y fluctuante
            variacion = random.uniform(-1.0, 1.0)
            self.presion = max(75.0, min(85.0, self.presion + variacion))
        else:
            # Válvula cerrada: presión baja y estable
            self.presion = max(5.0, min(15.0, self.presion + random.uniform(-0.5, 0.5)))


@dataclass
class Tanque:
    nombre: str
    capacidad: float
    nivel_actual: float
    flujo_entrada: float = 0.0
    flujo_salida: float = 0.0

    def actualizar_nivel(self, dt: float = 2.0):
        """Actualiza el nivel del tanque basado en flujos"""
        flujo_neto = self.flujo_entrada - self.flujo_salida
        cambio = flujo_neto * dt
        self.nivel_actual = max(0.0, min(self.capacidad, self.nivel_actual + cambio))

    def get_porcentaje(self) -> float:
        return (self.nivel_actual / self.capacidad) * 100.0


class SistemaSimulacion:
    def __init__(self):
        self.valvulas = {
            1: Valvula(1, 5.0, False),  # Empezar con presión baja
            2: Valvula(2, 5.0, False),
            3: Valvula(3, 5.0, False),
        }

        self.tanques = {
            "principal": Tanque("Principal", 2000.0, 2000.0),  # Empezar LLENO
            "secundario1": Tanque("Secundario1", 1000.0, 0.0),  # Empezar VACÍO
            "secundario2": Tanque("Secundario2", 1000.0, 0.0),  # Empezar VACÍO
        }

        self.flujo_base = 5.0

    def calcular_flujos(self):
        """Calcula los flujos del sistema basado en topología y estados de válvulas"""
        # Solo hay flujo si las válvulas permiten que el líquido llegue a destinos
        flujo_v2 = (
            self.flujo_base
            if (self.valvulas[1].estado and self.valvulas[2].estado)
            else 0.0
        )
        flujo_v3 = (
            self.flujo_base
            if (self.valvulas[1].estado and self.valvulas[3].estado)
            else 0.0
        )

        # El flujo principal es la suma de lo que realmente sale hacia otros tanques
        flujo_principal = flujo_v2 + flujo_v3

        # Actualizar flujos en tanques
        self.tanques["principal"].flujo_salida = flujo_principal
        self.tanques["secundario1"].flujo_entrada = flujo_v2
        self.tanques["secundario2"].flujo_entrada = flujo_v3

        return {
            "principal_a_v1": flujo_principal,
            "v1_a_v2": flujo_v2,
            "v1_a_v3": flujo_v3,
            "v2_a_s1": flujo_v2,
            "v3_a_s2": flujo_v3,
        }

    def actualizar_sistema(self):
        """Actualiza todo el sistema"""
        # Calcular flujos
        flujos = self.calcular_flujos()

        # Actualizar válvulas
        for valvula in self.valvulas.values():
            valvula.actualizar_presion()

        # Actualizar tanques
        for tanque in self.tanques.values():
            tanque.actualizar_nivel()

        return flujos

    def cambiar_valvula(self, valvula_id: int, nuevo_estado: bool):
        """Cambia el estado de una válvula"""
        if valvula_id in self.valvulas:
            self.valvulas[valvula_id].estado = nuevo_estado
            print(f"🔧 Válvula {valvula_id} {'ABIERTA' if nuevo_estado else 'CERRADA'}")

    def get_datos_mqtt(self, flujos: Dict[str, float]) -> Dict[str, Any]:
        """Genera los datos para enviar por MQTT"""
        return {
            # Tanques
            "principal": round(self.tanques["principal"].nivel_actual, 1),
            "secundario1": round(self.tanques["secundario1"].nivel_actual, 1),
            "secundario2": round(self.tanques["secundario2"].nivel_actual, 1),
            # Válvulas
            "valvula1_presion": round(self.valvulas[1].presion, 1),
            "valvula1_estado": self.valvulas[1].estado,
            "valvula2_presion": round(self.valvulas[2].presion, 1),
            "valvula2_estado": self.valvulas[2].estado,
            "valvula3_presion": round(self.valvulas[3].presion, 1),
            "valvula3_estado": self.valvulas[3].estado,
            # Flujos para líneas dinámicas
            "flujos": flujos,
            "flujo_total": round(sum(flujos.values()), 2),
        }


class MQTTManager:
    def __init__(self, sistema: SistemaSimulacion):
        self.sistema = sistema
        self.client = mqtt.Client()
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
            if comando.get("tipo") == "valvula":
                valvula_id = comando.get("id")
                estado = comando.get("estado")
                self.sistema.cambiar_valvula(valvula_id, estado)
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

    print("🚀 Simulador avanzado iniciado...")
    print("📊 Sistema de tanques en cascada activo")
    print("🎛️  Control bidireccional de válvulas habilitado")

    try:
        while True:
            # Actualizar sistema
            flujos = sistema.actualizar_sistema()

            # Preparar datos
            datos = sistema.get_datos_mqtt(flujos)

            # Publicar
            mqtt_manager.publicar_datos(datos)

            # Log de estado
            print(
                f"📊 Principal: {datos['principal']:.0f}L | S1: {datos['secundario1']:.0f}L | S2: {datos['secundario2']:.0f}L"
            )
            print(
                f"🚿 Flujos - V1: {'✅' if sistema.valvulas[1].estado else '❌'} | V2: {'✅' if sistema.valvulas[2].estado else '❌'} | V3: {'✅' if sistema.valvulas[3].estado else '❌'}"
            )

            time.sleep(2)

    except KeyboardInterrupt:
        print("\n🛑 Simulador detenido")
    finally:
        mqtt_manager.desconectar()


if __name__ == "__main__":
    main()
