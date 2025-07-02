import { Panel } from '@xyflow/react';
import { GraficaLinea } from '../components/GraficaLinea';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { DownloadButton } from '../components/DownloadButton';
import { X, BarChart3 } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { useState } from 'react';

const graficasConfig = [
  { key: 'valvula1', titulo: 'Válvula 1', color: '#8884d8' },
  { key: 'valvula2', titulo: 'Válvula 2', color: '#82ca9d' },
  { key: 'valvula3', titulo: 'Válvula 3', color: '#ffc658' }
];

export function GraficasPanel({ datosGrafico, historia, connected }) {
  const [isMinimized, setIsMinimized] = useState(false);
  const [isVisible, setIsVisible] = useState(true);

  if (!isVisible) {
    return (
      <Panel position="top-right">
        <Button
          onClick={() => setIsVisible(true)}
          variant="outline"
          size="sm"
          className="bg-card"
        >
          <BarChart3 className="h-4 w-4" />
        </Button>
      </Panel>
    );
  }

  return (
    <Panel position="top-right" className="m-4">
      <Card className="w-[800px] max-h-[600px] overflow-auto shadow-lg bg-neutral-100">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <CardTitle className="text-lg">Monitoreo en Tiempo Real</CardTitle>
              <Badge variant={connected ? "default" : "destructive"}>
                {connected ? 'Conectado' : 'Desconectado'}
              </Badge>
            </div>
            <div className="flex items-center space-x-2">
              <DownloadButton historia={historia} filename="historial_sistema.json" />
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsMinimized(!isMinimized)}
              >
                {isMinimized ? '+' : '−'}
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsVisible(false)}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardHeader>

        {!isMinimized && (
          <CardContent>
            {/* Gráficas de presión */}
            <div>
              <h3 className="text-sm font-medium mb-3">Historial de Presión</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                {graficasConfig.map(({ key, titulo, color }) => (
                  <GraficaLinea
                    key={key}
                    datos={datosGrafico?.[key] || []}
                    titulo={titulo}
                    color={color}
                    dataKey="presion"
                    unidad="kPa"
                    domainMin={70}
                    domainMax={90}
                    etiqueta="Presión"
                  />
                ))}
              </div>
            </div>
          </CardContent>
        )}
      </Card>
    </Panel>
  );
} 