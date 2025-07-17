import { useState, useEffect } from 'react';
import { Loader2 } from 'lucide-react';

export function ConnectionStatus({ connected, lastDataTime }) {
  const [showOverlay, setShowOverlay] = useState(true);
  const [statusType, setStatusType] = useState('connecting');

  useEffect(() => {
    if (!connected) {
      setShowOverlay(true);
      setStatusType('connecting');
      return;
    }

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

  return (
    <div className="absolute top-10 left-10 z-50">
      <div className="bg-card border border-border rounded p-4 text-center flex items-center gap-4">
        <div className="flex justify-center items-center">
          <Loader2 className="animate-spin size-8 text-yellow-500" />
        </div>
        <h2 className="text-xl font-semibold">{getTitle()}</h2>
      </div>
    </div>
  );
} 