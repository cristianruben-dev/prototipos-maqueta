import { memo } from 'react';
import { GraficaLinea } from './GraficaLinea';
import { DownloadButton } from './DownloadButton';

const graficasConfig = [
  { key: 'sensor_pre_v1', titulo: 'Sensor Pre-V1', color: '#ff7c7c' },
  { key: 'sensor_post_v1', titulo: 'Sensor Post-V1', color: '#87ceeb' },
  { key: 'sensor_pre_v2', titulo: 'Sensor Pre-V2', color: '#ffa500' },
  { key: 'sensor_post_v2', titulo: 'Sensor Post-V2', color: '#98fb98' }
];

const GraficasPanel = memo(function GraficasPanel({ datosGrafico, historia, sessionStartTime, onLimpiarHistorial }) {
  return (
    <div className="p-4 h-full">
      <DownloadButton
        historia={historia}
        filename="historial_sistema.json"
        sessionStartTime={sessionStartTime}
        onLimpiarHistorial={onLimpiarHistorial}
      />

      <div className="grid grid-cols-1 gap-3 mt-6">
        {graficasConfig.map(({ key, titulo, color }) => (
          <GraficaLinea
            key={key}
            datos={datosGrafico?.[key] || []}
            titulo={titulo}
            color={color}
            dataKey="presion"
            unidad="PSI"
            domainMin={0}
            domainMax={7} // Ajustado para PSI (90 kPa ≈ 13 PSI)
            etiqueta="Presión"
          />
        ))}
      </div>
    </div>
  );
});

export { GraficasPanel };