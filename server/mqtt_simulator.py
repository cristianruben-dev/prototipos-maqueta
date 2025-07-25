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


# Tomas clandestinas removidas - solo se simularán alertas visuales


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
            3: Valvula(
                3, 2.0, False
            ),  # Válvula 3: entrada tanque izquierdo 1
            4: Valvula(
                4, 2.0, False
            ),  # Válvula 4: entrada tanque izquierdo 2
            5: Valvula(
                5, 2.0, False
            ),  # Válvula 5: entrada tanque derecho 1
            6: Valvula(
                6, 2.0, False
            ),  # Válvula 6: entrada tanque derecho 2
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

        # Tomas clandestinas removidas - solo alertas simuladas
        
        # Variables para simulación de fuga
        self.simulando_fuga = False
        self.fuga_intensidad = 0.0

        self.flujo_base = 3.0  # Reducir velocidad del flujo

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
            nivel_promedio_izq * 120 + 30
        )  # Aumentar presión base para mejor visibilidad en PSI

        # **LÓGICA CORREGIDA: Verificar válvulas de tanques también**
        # Válvulas principales (1 y 2) deben estar abiertas
        valvulas_principales_abiertas = self.valvulas[1].estado and self.valvulas[2].estado
        
        # Verificar válvulas de salida de tanques izquierdos (3 y 4)
        puede_salir_izq1 = self.valvulas[3].estado and izq1.nivel_actual > 5
        puede_salir_izq2 = self.valvulas[4].estado and izq2.nivel_actual > 5
        hay_salida_disponible = puede_salir_izq1 or puede_salir_izq2
        
        # Verificar válvulas de entrada de tanques derechos (5 y 6)
        puede_entrar_der1 = self.valvulas[5].estado
        puede_entrar_der2 = self.valvulas[6].estado
        hay_entrada_disponible = puede_entrar_der1 or puede_entrar_der2

        flujos = {"flujo_v1": 0.0, "flujo_v2": 0.0, "flujo_total": 0.0}

        # Solo hay flujo si TODAS las condiciones se cumplen:
        # 1. Válvulas principales abiertas (1 y 2)
        # 2. Al menos una válvula de salida de tanques izquierdos abierta (3 o 4)
        # 3. Al menos una válvula de entrada de tanques derechos abierta (5 o 6)
        # 4. Hay líquido disponible en tanques de origen
        if (valvulas_principales_abiertas and 
            hay_salida_disponible and 
            hay_entrada_disponible):
            # Calcular espacio disponible SOLO en tanques con válvulas de entrada abiertas
            espacio_der1 = (der1.capacidad - der1.nivel_actual) if puede_entrar_der1 else 0
            espacio_der2 = (der2.capacidad - der2.nivel_actual) if puede_entrar_der2 else 0
            espacio_total = espacio_der1 + espacio_der2

            if espacio_total > 1.0:
                # Calcular flujo disponible SOLO desde tanques con válvulas de salida abiertas
                liquido_disponible_izq1 = max(0, izq1.nivel_actual - 2) if puede_salir_izq1 else 0
                liquido_disponible_izq2 = max(0, izq2.nivel_actual - 2) if puede_salir_izq2 else 0
                total_liquido_disponible = liquido_disponible_izq1 + liquido_disponible_izq2
                
                if total_liquido_disponible > 0:
                    # Calcular flujo base
                    nivel_promedio_disponible = total_liquido_disponible / 1000  # Normalizar
                    flujo_base_disponible = self.flujo_base * 1.2
                    flujo_total = min(
                        flujo_base_disponible * nivel_promedio_disponible + 2.0,
                        espacio_total / 2.0,
                        total_liquido_disponible / 2.0  # No puede sacar más de lo disponible
                    )

                    if flujo_total > 0:
                        # Distribuir flujo SOLO a tanques con válvulas de entrada abiertas
                        if espacio_total > 0:
                            proporcion_der1 = espacio_der1 / espacio_total
                            proporcion_der2 = espacio_der2 / espacio_total
                        else:
                            proporcion_der1 = 0
                            proporcion_der2 = 0

                        flujo_a_der1 = flujo_total * proporcion_der1
                        flujo_a_der2 = flujo_total * proporcion_der2

                        # Distribuir salida SOLO desde tanques con válvulas de salida abiertas
                        if total_liquido_disponible > 0:
                            proporcion_izq1 = liquido_disponible_izq1 / total_liquido_disponible
                            proporcion_izq2 = liquido_disponible_izq2 / total_liquido_disponible
                        else:
                            proporcion_izq1 = 0
                            proporcion_izq2 = 0

                        salida_izq1 = flujo_total * proporcion_izq1
                        salida_izq2 = flujo_total * proporcion_izq2

                        # Actualizar flujos SOLO si las válvulas correspondientes están abiertas
                        if puede_salir_izq1:
                            izq1.flujo_salida += salida_izq1
                        if puede_salir_izq2:
                            izq2.flujo_salida += salida_izq2
                        if puede_entrar_der1:
                            der1.flujo_entrada += flujo_a_der1
                        if puede_entrar_der2:
                            der2.flujo_entrada += flujo_a_der2

                        flujos["flujo_total"] = flujo_total

            # Calcular presiones del sistema - SIN FUGA las presiones son similares
            presion_pre_v1 = presion_base_tuberia + random.uniform(-2, 2)
            presion_post_v1 = presion_pre_v1 * 0.98 + random.uniform(-0.5, 0.5)  # Pérdida mínima sin fuga

            # Calcular presión antes de V2 - similar a post-v1 sin fuga
            presion_pre_v2 = presion_post_v1 * 0.98 + random.uniform(-0.5, 0.5)

            # Presión después de V2 - similar a pre-v2 sin fuga
            presion_post_v2 = presion_pre_v2 * 0.98 + random.uniform(-0.5, 0.5)

            # Aplicar efectos de fuga SOLO si está activa
            if self.simulando_fuga:
                # Reducir pre-v2 y post-v2 aproximadamente a la mitad
                presion_pre_v2 = presion_pre_v2 * 0.5    # Reducir a la mitad
                presion_post_v2 = presion_post_v2 * 0.5  # Reducir a la mitad
            
            # Actualizar presiones en sensores - CON FLUJO (ambas válvulas abiertas)
            self.sensores["sensor_pre_v1"]["presion"] = presion_pre_v1
            self.sensores["sensor_post_v1"]["presion"] = presion_post_v1
            self.sensores["sensor_pre_v2"]["presion"] = presion_pre_v2
            self.sensores["sensor_post_v2"]["presion"] = presion_post_v2
        else:
            # SIN FLUJO - Al menos una válvula está cerrada o no hay suficiente líquido

            # Sin cálculo de tomas clandestinas - solo alertas visuales

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
                f"⚠️  ID de válvula inválido: {valvula_id} (válvulas disponibles: 1-6)"
            )
    
    def simular_fuga(self, intensidad: float = 5.0):
        """Simula una fuga en el tramo entre post-v1 y pre-v2"""
        self.simulando_fuga = True
        self.fuga_intensidad = intensidad
        print(f"💧 Simulando fuga con intensidad {intensidad}")
    
    def detener_fuga(self):
        """Detiene la simulación de fuga"""
        self.simulando_fuga = False
        self.fuga_intensidad = 0.0
        print("✅ Fuga detenida")

    # Método cambiar_toma_clandestina removido - solo alertas simuladas

    def get_datos_mqtt(self, flujos: Dict[str, float]) -> Dict[str, Any]:
        """Genera los datos para enviar por MQTT en el nuevo formato"""
        return {
            # Tanques - nuevo formato
            "tanque_izq_1": round(self.tanques["tanque_izq_1"].nivel_actual, 1),
            "tanque_izq_2": round(self.tanques["tanque_izq_2"].nivel_actual, 1),
            "tanque_der_1": round(self.tanques["tanque_der_1"].nivel_actual, 1),
            "tanque_der_2": round(self.tanques["tanque_der_2"].nivel_actual, 1),
            # Válvulas principales - presión interna y estado
            "valvula1_presion_interna": round(self.valvulas[1].presion, 1),
            "valvula1_estado": self.valvulas[1].estado,
            "valvula2_presion_interna": round(self.valvulas[2].presion, 1),
            "valvula2_estado": self.valvulas[2].estado,
            # Válvulas de tanques - estado
            "valvula_tanque_izq_1_estado": self.valvulas[3].estado,
            "valvula_tanque_izq_1_presion": round(self.valvulas[3].presion, 1),
            "valvula_tanque_izq_2_estado": self.valvulas[4].estado,
            "valvula_tanque_izq_2_presion": round(self.valvulas[4].presion, 1),
            "valvula_tanque_der_1_estado": self.valvulas[5].estado,
            "valvula_tanque_der_1_presion": round(self.valvulas[5].presion, 1),
            "valvula_tanque_der_2_estado": self.valvulas[6].estado,
            "valvula_tanque_der_2_presion": round(self.valvulas[6].presion, 1),
            # Sensores de presión independientes
            "sensor_pre_v1": round(self.sensores["sensor_pre_v1"]["presion"], 1),
            "sensor_post_v1": round(self.sensores["sensor_post_v1"]["presion"], 1),
            "sensor_pre_v2": round(self.sensores["sensor_pre_v2"]["presion"], 1),
            "sensor_post_v2": round(self.sensores["sensor_post_v2"]["presion"], 1),
            # Tomas clandestinas removidas - solo alertas simuladas
            "toma1_estado": False,
            "toma1_flujo": 0.0,
            "toma2_estado": False,
            "toma2_flujo": 0.0,
            # Información del sistema
            "sistema_activo": any(v.estado for v in self.valvulas.values()),
            "flujos": flujos,
            "flujo_total": round(sum(flujos.values()), 2),
            # Detección de tomas clandestinas - siempre falso
            "tomas_detectadas": False,
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
            
            # Formato nuevo: {"tipo": "valvula", "id": 1, "estado": true}
            if comando.get("tipo") == "valvula":
                valvula_id = comando.get("id")
                estado = comando.get("estado")
                self.sistema.cambiar_valvula(valvula_id, estado)
            
            # Formato legacy: {"comando": "valvula1", "valor": true}
            elif comando.get("comando") in ["valvula1", "valvula2", "valvula3", "valvula4", "valvula5", "valvula6"]:
                valvula_num = int(comando.get("comando").replace("valvula", ""))
                self.sistema.cambiar_valvula(valvula_num, comando.get("valor"))
            
            # Comando de pausa
            elif comando.get("comando") == "pausar":
                self.sistema.pausado = comando.get("valor")
                print(f"🔄 Sistema {'PAUSADO' if comando.get('valor') else 'REANUDADO'}")
            
            # Comandos de fuga
            elif comando.get("comando") == "simular_fuga":
                intensidad = comando.get("intensidad", 5.0)
                self.sistema.simular_fuga(intensidad)
            
            elif comando.get("comando") == "detener_fuga":
                self.sistema.detener_fuga()
            
            # Comandos de tomas clandestinas removidos - solo alertas visuales simuladas
            else:
                print(f"⚠️  Comando desconocido: {comando}")
                
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

            # Información de tomas clandestinas removida

            time.sleep(2)

    except KeyboardInterrupt:
        print("\n🛑 Simulador detenido")
    finally:
        mqtt_manager.desconectar()


if __name__ == "__main__":
    main()
