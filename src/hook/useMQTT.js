import { useState, useEffect } from "react";
import mqtt from "mqtt";

export function useMQTT(brokerUrl = "ws://localhost:9001", topic) {
  const [data, setData] = useState(null);
  const [connected, setConnected] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Si no hay topic, no conectar
    if (!topic) {
      return;
    }

    let client;

    try {
      console.log(`🔌 Conectando a MQTT: ${brokerUrl}`);
      client = mqtt.connect(brokerUrl);

      client.on("connect", () => {
        console.log(`✅ Conectado a MQTT, suscribiendo a: ${topic}`);
        setConnected(true);
        setError(null);
        client.subscribe(topic, (err) => {
          if (err) {
            console.error("Error suscribiendo:", err);
            setError(err.message);
          }
        });
      });

      client.on("message", (receivedTopic, message) => {
        if (receivedTopic === topic) {
          try {
            const messageStr = message.toString();
            setData(messageStr);
          } catch (error) {
            console.error("Error procesando mensaje:", error);
            setError(error.message);
          }
        }
      });

      client.on("error", (err) => {
        console.error("Error MQTT:", err);
        setConnected(false);
        setError(err.message);
      });

      client.on("close", () => {
        console.log("🔌 Conexión MQTT cerrada");
        setConnected(false);
      });

      client.on("disconnect", () => {
        console.log("❌ Desconectado de MQTT");
        setConnected(false);
      });

    } catch (err) {
      console.error("Error creando cliente MQTT:", err);
      setError(err.message);
    }

    return () => {
      if (client) {
        console.log("🧹 Limpiando conexión MQTT");
        client.end();
      }
    };
  }, [topic, brokerUrl]);

  return { data, connected, error };
}