import { useState, useEffect } from 'react';
import { ClockIcon, Loader2 } from 'lucide-react';

export function ConnectionStatus({ connected, lastDataTime }) {
  const [showOverlay, setShowOverlay] = useState(true);
  const [statusType, setStatusType] = useState('connecting'); // 'connecting', 'waiting', 'connected'

  useEffect(() => {
    if (!connected) {
      setShowOverlay(true);
      setStatusType('connecting');
      return;
    }

    // Si está conectado pero no hay datos recientes (últimos 5 segundos)
    const now = Date.now();
    const timeSinceLastData = now - (lastDataTime || 0);

    if (timeSinceLastData > 5000) {
      setShowOverlay(true);
      setStatusType('waiting');
    } else {
      setShowOverlay(false);
      setStatusType('connected');
    }
  }, [connected, lastDataTime]);

  if (!showOverlay) return null;

  const getIcon = () => {
    switch (statusType) {
      case 'connecting':
        return (
          <Loader2 className="animate-spin size-8 text-yellow-500" />
        );
      case 'waiting':
        return (
          <ClockIcon className="animate-pulse size-8 text-yellow-500" />
        );
      default:
        return null;
    }
  };

  const getTitle = () => {
    switch (statusType) {
      case 'connecting':
        return 'Conectando al sistema';
      case 'waiting':
        return 'Simulador desconectado';
      default:
        return 'Conectado';
    }
  };

  const getDescription = () => {
    switch (statusType) {
      case 'connecting':
        return 'Estableciendo conexión con el broker MQTT...';
      case 'waiting':
        return 'El broker MQTT está conectado pero el simulador no está enviando datos.';
      default:
        return 'Sistema funcionando correctamente';
    }
  };

  return (
    <div className="absolute inset-0 z-50 bg-black/20 backdrop-blur-sm flex items-center justify-center">
      <div className="bg-card border border-border rounded-lg p-8 shadow-lg text-center max-w-md">
        <div className="flex justify-center items-center mb-4">
          {getIcon()}
        </div>
        <h2 className="text-xl font-semibold mb-2">{getTitle()}</h2>
        <p className="text-muted-foreground mb-4">
          {getDescription()}
        </p>
      </div>
    </div>
  );
} 