import { useState, useEffect } from "react";
import mqtt from "mqtt";

export function useMQTT(brokerUrl, topic) {
  const [data, setData] = useState(null);
  const [connected, setConnected] = useState(false);

  useEffect(() => {
    if (!topic) return;

    const client = mqtt.connect(brokerUrl);

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

    return () => client.end();
  }, [topic, brokerUrl]);

  return { data, connected };
}