import React, { memo } from 'react';
import { Panel } from '@xyflow/react';
import { GraficaLinea } from '../components/GraficaLinea';
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { DownloadButton } from '../components/DownloadButton';

const graficasConfig = [
  { key: 'sensor_pre_v1', titulo: 'Sensor Pre-V1', color: '#ff7c7c' },
  { key: 'sensor_post_v1', titulo: 'Sensor Post-V1', color: '#87ceeb' },
  { key: 'sensor_pre_v2', titulo: 'Sensor Pre-V2', color: '#ffa500' },
  { key: 'sensor_post_v2', titulo: 'Sensor Post-V2', color: '#98fb98' }
];

const GraficasPanel = memo(function GraficasPanel({ datosGrafico, historia, connected, sessionStartTime, onLimpiarHistorial }) {

  return (
    <Panel position="center-right" className="m-4">
      <Card className="w-[400px] max-h-[full] overflow-auto shadow-lg bg-neutral-100">
        <CardHeader>
          <DownloadButton historia={historia} filename="historial_sistema.json" sessionStartTime={sessionStartTime} onLimpiarHistorial={onLimpiarHistorial} />
        </CardHeader>

        <CardContent>
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
        </CardContent>
      </Card>
    </Panel>
  );
});

export { GraficasPanel }; 