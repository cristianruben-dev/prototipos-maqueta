import { useState, useEffect, useRef, useCallback } from "react";
import mqtt from "mqtt";

export function useMQTT(brokerUrl, topic) {
  const [data, setData] = useState(null);
  const [connected, setConnected] = useState(false);
  const clientRef = useRef(null);

  useEffect(() => {
    if (!topic) return;

    const client = mqtt.connect(brokerUrl);
    clientRef.current = client;

    client.on("connect", () => {
      setConnected(true);
      client.subscribe(topic);
    });

    client.on("message", (receivedTopic, message) => {
      if (receivedTopic === topic) {
        setData(message.toString());
      }
    });

    client.on("close", () => setConnected(false));

    return () => {
      client.end();
      clientRef.current = null;
    };
  }, [topic, brokerUrl]);

  const sendCommand = useCallback((commandTopic, command) => {
    if (clientRef.current && connected) {
      const mensaje = JSON.stringify(command);
      clientRef.current.publish(commandTopic, mensaje);
      console.log(`📤 Comando enviado:`, command);
    }
  }, [connected]);

  return { data, connected, sendCommand };
}