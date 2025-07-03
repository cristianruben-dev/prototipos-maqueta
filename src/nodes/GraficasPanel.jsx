import { Panel } from '@xyflow/react';
import { GraficaLinea } from '../components/GraficaLinea';
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { DownloadButton } from '../components/DownloadButton';

const graficasConfig = [
  { key: 'valvula1', titulo: 'Válvula 1', color: '#8884d8' },
  { key: 'valvula2', titulo: 'Válvula 2', color: '#82ca9d' },
  { key: 'valvula3', titulo: 'Válvula 3', color: '#ffc658' }
];

export function GraficasPanel({ datosGrafico, historia, connected, sessionStartTime, onLimpiarHistorial }) {

  return (
    <Panel position="center-right" className="m-4">
      <Card className="w-[400px] max-h-[full] overflow-auto shadow-lg bg-neutral-100">
        <CardHeader>
          <DownloadButton historia={historia} filename="historial_sistema.json" sessionStartTime={sessionStartTime} onLimpiarHistorial={onLimpiarHistorial} />
        </CardHeader>

        <CardContent>
          <div>
            <h3 className="text-sm font-medium mb-3">Historial de Presión</h3>
            <div className="grid grid-cols-1 gap-3">
              {graficasConfig.map(({ key, titulo, color }) => (
                <GraficaLinea
                  key={key}
                  datos={datosGrafico?.[key] || []}
                  titulo={titulo}
                  color={color}
                  dataKey="presion"
                  unidad="kPa"
                  domainMin={0}
                  domainMax={90}
                  etiqueta="Presión"
                />
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    </Panel>
  );
} 